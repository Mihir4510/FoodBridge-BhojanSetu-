// backend/controllers/driverController.js
// CommonJS version (module.exports)
//
// FIXES APPLIED:
//   ✅ Bug #1: donation.organization → donation.organizationId (pickupDonation + completeDonation)
//   ✅ Bug #2: .populate("donor") → .populate("donorId") in getRoute()
//   ✅ Improvement: completeDonation now notifies DONOR too (not just NGO)

const bcrypt        = require("bcryptjs");
const jwt           = require("jsonwebtoken");
const Driver        = require("../models/driver.model");
const Donation      = require("../models/donation.model");
const optimizeRoute = require("../utils/routeOptimizer");
const matchDriver = require("../utils/matchDriver");

const generateToken = (id) =>
  jwt.sign({ id, type: "driver" }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sendCookie = (res, token) =>
  res.cookie("driverToken", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });

// ── Register Driver (by NGO) ───────────────────────────────
const registerDriver = async (req, res) => {
  try {
    const { name, email, phone, capacity, city, lng, lat } = req.body;

    const exists = await Driver.findOne({ email });
    if (exists) return res.status(400).json({ message: "Driver email already registered." });

    const hashed = await bcrypt.hash(phone, 10);
    const driver = await Driver.create({
      name, email, password: hashed, phone,
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
      driver:  { id: driver._id, name: driver.name, email: driver.email, phone: driver.phone },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error registering driver." });
  }
};

// ── Driver Login ───────────────────────────────────────────
const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email }).populate("ngoId", "name email ngoName");
    if (!driver) return res.status(400).json({ message: "Invalid credentials." });

    const match = await bcrypt.compare(password, driver.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials." });

    const token = generateToken(driver._id);
    sendCookie(res, token);

    res.status(200).json({
      message: "Login successful.",
      driver: {
        id:              driver._id,
        name:            driver.name,
        email:           driver.email,
        phone:           driver.phone,
        ngo:             driver.ngoId,
        isAvailable:     driver.isAvailable,
        capacity:        driver.capacity,
        totalDeliveries: driver.totalDeliveries,
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
      .populate("donorId",        "name email location") // ✅ donorId (not donor)
      .populate("organizationId", "name location ngoName") // ✅ organizationId
      .sort({ assignedAt: -1 });

    res.status(200).json({ donations });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donations." });
  }
};

// ── Driver Picks Up Food ───────────────────────────────────
const pickupDonation = async (req, res) => {
  try {
    const donation = await Donation.findOneAndUpdate(
      { _id: req.params.id, driverId: req.driver._id, status: "assigned" },
      { status: "picked_up", pickedUpAt: new Date() },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation not found or already picked up." });
    }

    // ✅ BUG #1 FIXED: use organizationId not organization
    if (req.io) {
      req.io.to(`ngo_${donation.organizationId}`).emit("donationPickedUp", {
        donationId: donation._id,
        title:      donation.title,
        driver:     req.driver.name,
        message:    `${req.driver.name} picked up "${donation.title}"`,
      });
    }

    res.status(200).json({ message: "Marked as picked up!", donation });
  } catch (err) {
    res.status(500).json({ message: "Failed to update pickup status." });
  }
};

// ── Driver Completes Delivery ──────────────────────────────
const completeDonation = async (req, res) => {
  try {
    const donation = await Donation.findOneAndUpdate(
      { _id: req.params.id, driverId: req.driver._id, status: "picked_up" },
      { status: "completed", completedAt: new Date() },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation not found or not yet picked up." });
    }

    // Free up driver for next assignment
    await Driver.findByIdAndUpdate(req.driver._id, {
      isAvailable:       true,
      currentDonationId: null,
      $inc:              { totalDeliveries: 1 },
    });

    // 1. expire old donations first
await Donation.updateMany(
  {
    status: { $in: ["pending", "accepted"] },
    expiryTime: { $lte: new Date() }
  },
  { status: "expired" }
);

    const pendingDonations = await Donation.find({
  organizationId: donation.organizationId,
  status: "accepted",
  driverId: null,
  expiryTime: { $gt: new Date() } 
}).sort({ createdAt: 1 });

for (let d of pendingDonations) {
  const result = await matchDriver(d, donation.organizationId, req.io);
  if (result) break;
}

    if (req.io) {
      // ✅ BUG #1 FIXED: use organizationId not organization
      req.io.to(`ngo_${donation.organizationId}`).emit("donationCompleted", {
        donationId: donation._id,
        title:      donation.title,
        driver:     req.driver.name,
        message:    `"${donation.title}" delivered successfully! 🎉`,
      });

      // ✅ IMPROVEMENT #4: also notify DONOR
      req.io.to(`donor_${donation.donorId}`).emit("donationCompleted", {
        donationId: donation._id,
        title:      donation.title,
        message:    `Your donation "${donation.title}" has been delivered to the community. Thank you! 🌿`,
      });
    }

    res.status(200).json({ message: "Delivery completed! Great work. 🎉", donation });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete delivery." });
  }
};

// ── Get Optimized Route for Driver ────────────────────────
const getRoute = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver._id).populate("ngoId");

    const donations = await Donation.find({
      driverId: req.driver._id,
      status:   { $in: ["assigned", "picked_up"] },
    })
      .populate("donorId", "name location"); // ✅ BUG #2 FIXED: donorId not donor

    if (!donations.length) {
      return res.status(200).json({
        route: [], totalDistance: 0, estimatedMinutes: 0, stopCount: 0,
      });
    }

    const driverLoc = {
      lat: driver.location.coordinates[1],
      lng: driver.location.coordinates[0],
    };

    const ngoLoc = driver.ngoId?.location?.coordinates
      ? {
          lat: driver.ngoId.location.coordinates[1],
          lng: driver.ngoId.location.coordinates[0],
        }
      : null;

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

// ── Update Driver GPS Location ─────────────────────────────
const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ message: "lat and lng required." });

    await Driver.findByIdAndUpdate(req.driver._id, {
      location: { type: "Point", coordinates: [lng, lat] },
    });

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

module.exports = {
  registerDriver,
  loginDriver,
  getMyDonations,
  pickupDonation,
  completeDonation,
  getRoute,
  updateLocation,
  getAllDrivers,
};
