// backend/controllers/driverController.js
// Handles: register driver, get assigned donations, pickup, complete, route
//
// ROUTES THIS POWERS:
//   POST   /api/driver/register          — NGO registers a new driver
//   POST   /api/driver/login             — Driver logs in
//   GET    /api/driver/my-donations      — Driver sees assigned donations
//   PUT    /api/driver/pickup/:id        — Driver marks food as picked up
//   PUT    /api/driver/complete/:id      — Driver marks delivery complete
//   GET    /api/driver/route             — Get optimized route for driver
//   PUT    /api/driver/location          — Driver updates their GPS location
//   GET    /api/driver/all              — NGO sees all their drivers

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Driver = require("../models/driver.model.js");
const Donation = require("../models/donation.model.js");
const optimizeRoute = require("../utils/routeOptimizer.js");

// ── Helper: JWT token ──────────────────────────────────────
const generateToken = (id, type = "driver") =>
  jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sendCookie = (res, token) =>
  res.cookie("driverToken", token, {
    httpOnly: true,
    // secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });

// ── Register Driver (by NGO) ───────────────────────────────
const registerDriver = async (req, res) => {
  try {
    const { name, email, phone, capacity, city, lng, lat } = req.body;

    const exists = await Driver.findOne({ email });
    if (exists) return res.status(400).json({ message: "Driver email already registered." });

    // Default password = phone number (driver must change on first login)
    const hashed = await bcrypt.hash(phone, 10);

    const driver = await Driver.create({
      name,
      email,
      password: hashed,
      phone,
      ngoId:    req.user._id,
      capacity: capacity || 50,
      location: {
        type:        "Point",
        coordinates: [lng || 0, lat || 0],
        city:        city || "",
      },
    });

    res.status(201).json({
      message: "Driver registered successfully.",
      driver:  { id: driver._id, name: driver.name, email: driver.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error registering driver." });
  }
};

// ── Driver Login ───────────────────────────────────────────
const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email }).populate("ngoId", "name email");
    if (!driver) return res.status(400).json({ message: "Invalid credentials." });

    const match = await bcrypt.compare(password, driver.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials." });

    const token = generateToken(driver._id);
    sendCookie(res, token);

    res.status(200).json({
      message: "Login successful.",
      driver: {
        id:          driver._id,
        name:        driver.name,
        email:       driver.email,
        phone:       driver.phone,
        ngo:         driver.ngoId,
        isAvailable: driver.isAvailable,
        capacity:    driver.capacity,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during driver login." });
  }
};

// ── Get Driver's Assigned Donations ───────────────────────
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      driverId: req.driver._id,
      status:   { $in: ["assigned", "picked_up"] },
    })
      .populate("donor", "name email location")
      .populate("organization", "name location")
      .sort({ assignedAt: -1 });

    res.status(200).json({ donations });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donations." });
  }
};

// ── Driver Picks Up Food ───────────────────────────────────
const pickupDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findOneAndUpdate(
      { _id: id, driverId: req.driver._id, status: "assigned" },
      { status: "picked_up", pickedUpAt: new Date() },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation not found or already picked up." });
    }

    // Notify NGO via Socket.IO
    if (req.io) {
      req.io.to(`ngo_${donation.organization}`).emit("donationPickedUp", {
        donationId: donation._id,
        title:      donation.title,
        driver:     req.driver.name,
        message:    `${req.driver.name} has picked up "${donation.title}"`,
      });
    }

    res.status(200).json({ message: "Marked as picked up.", donation });
  } catch (err) {
    res.status(500).json({ message: "Failed to update pickup status." });
  }
};

// ── Driver Completes Delivery ──────────────────────────────
const completeDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findOneAndUpdate(
      { _id: id, driverId: req.driver._id, status: "picked_up" },
      { status: "completed", completedAt: new Date() },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation not found or not yet picked up." });
    }

    // Free up the driver
    await Driver.findByIdAndUpdate(req.driver._id, {
      isAvailable:       true,
      currentDonationId: null,
      $inc:              { totalDeliveries: 1 },
    });

    // Notify NGO
    if (req.io) {
      req.io.to(`ngo_${donation.organization}`).emit("donationCompleted", {
        donationId: donation._id,
        title:      donation.title,
        driver:     req.driver.name,
        message:    `"${donation.title}" has been delivered successfully!`,
      });
    }

    res.status(200).json({ message: "Delivery completed!", donation });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete delivery." });
  }
};

// ── Get Optimized Route for Driver ────────────────────────
const getRoute = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver._id).populate("ngoId");

    // Get all assigned donations for this driver
    const donations = await Donation.find({
      driverId: req.driver._id,
      status:   { $in: ["assigned", "picked_up"] },
    }).populate("donor", "name location");

    if (!donations.length) {
      return res.status(200).json({ route: [], totalDistance: 0, estimatedMinutes: 0 });
    }

    // Driver's current location
    const driverLoc = {
      lat: driver.location.coordinates[1],
      lng: driver.location.coordinates[0],
    };

    // NGO location (final destination)
    const ngoLoc = driver.ngoId?.location?.coordinates
      ? { lat: driver.ngoId.location.coordinates[1], lng: driver.ngoId.location.coordinates[0] }
      : null;

    // Run TSP greedy optimizer
    const result = optimizeRoute(driverLoc, donations, ngoLoc);

    res.status(200).json({
      ...result,
      driverLocation: driverLoc,
      ngoLocation:    ngoLoc,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to compute route." });
  }
};

// ── Update Driver Location (GPS update from app) ──────────
const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ message: "lat and lng required." });

    await Driver.findByIdAndUpdate(req.driver._id, {
      location: { type: "Point", coordinates: [lng, lat] },
    });

    // Broadcast live location to NGO
    if (req.io) {
      const driver = await Driver.findById(req.driver._id);
      req.io.to(`ngo_${driver.ngoId}`).emit("driverLocationUpdated", {
        driverId: req.driver._id,
        name:     req.driver.name,
        lat, lng,
      });
    }

    res.status(200).json({ message: "Location updated." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update location." });
  }
};

// ── NGO: Get All Drivers ───────────────────────────────────
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ ngoId: req.user._id })
      .populate("currentDonationId", "title status")
      .sort({ createdAt: -1 });

    res.status(200).json({ drivers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch drivers." });
  }
};

module.exports={
    registerDriver,
    loginDriver,
    getMyDonations,
    pickupDonation,
    completeDonation,
    getRoute,
    updateLocation,
    getAllDrivers
}
