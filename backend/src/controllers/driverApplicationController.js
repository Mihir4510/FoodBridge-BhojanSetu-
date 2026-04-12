const bcrypt            = require("bcryptjs");
const User              = require("../models/user.model.js");
const Driver            = require("../models/driver.model.js");
const DriverApplication = require("../models/DriverApplication.js");

// ── GET /nearby-ngos ──────────────────────────────────────
const getNearbyNgos = async (req, res) => {
  try {
    const { lat, lng, radius = 50000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required." });
    }

    const ngos = await User.find({
      role: "organization",
      isApproved: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(radius),
        },
      },
    }).select("name email location city phone ngoName").limit(20);

    const haversine = (c1, c2) => {
      const toRad = (v) => (v * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(c2[1] - c1[1]);
      const dLon = toRad(c2[0] - c1[0]);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(c1[1])) * Math.cos(toRad(c2[1])) *
        Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const getLabel = (km) => {
      if (km <= 10) return { label: "Nearby", icon: "✅", warn: false };
      if (km <= 30) return { label: "Moderate", icon: "⚠️", warn: false };
      return { label: "Far", icon: "❗", warn: true };
    };

    const enriched = ngos.map((ngo) => {
      const dist = ngo.location?.coordinates
        ? parseFloat(
            haversine(
              [parseFloat(lng), parseFloat(lat)],
              ngo.location.coordinates
            ).toFixed(1)
          )
        : null;

      const { label, icon, warn } = getLabel(dist || 999);

      return {
        _id: ngo._id,
        name: ngo.ngoName || ngo.name,
        email: ngo.email,
        city: ngo.location?.city || ngo.city || "",
        distance: dist,
        distanceLabel: label,
        distanceIcon: icon,
        isWarn: warn,
        warnMessage: warn
          ? "This NGO is far from your location. You can still apply if you're willing to travel."
          : null,
      };
    }).sort((a, b) => (a.distance || 999) - (b.distance || 999));

    res.status(200).json({ ngos: enriched });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch nearby NGOs." });
  }
};

// ── POST /apply ───────────────────────────────────────────
const submitApplication = async (req, res) => {
  try {
    const {
      name, email, phone, city, vehicleType,
      capacity, experience, lat, lng, ngoId, distanceFromNgo,
    } = req.body;

    const existing = await DriverApplication.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "An application with this email already exists.",
        status: existing.status,
      });
    }

    const application = await DriverApplication.create({
      name,
      email,
      phone,
      city,
      vehicleType: vehicleType || "bike",
      capacity: Number(capacity) || 30,
      experience: experience || "",
      location: {
        type: "Point",
        coordinates: [parseFloat(lng) || 0, parseFloat(lat) || 0],
        city,
      },
      ngoId,
      distanceFromNgo: distanceFromNgo || null,
      status: "pending",
    });

    res.status(201).json({
      message: "Application submitted successfully!",
      applicationId: application._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit application." });
  }
};

// ── GET /applications ─────────────────────────────────────
const getApplications = async (req, res) => {
  try {
    const applications = await DriverApplication.find({ ngoId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications." });
  }
};

// ── PUT /approve/:id ──────────────────────────────────────
const approveApplication = async (req, res) => {
  try {
    const app = await DriverApplication.findOne({
      _id: req.params.id,
      ngoId: req.user._id,
    });

    if (!app) return res.status(404).json({ message: "Application not found." });
    if (app.status === "approved") return res.status(400).json({ message: "Already approved." });

    const hashed = await bcrypt.hash(app.phone, 10);

    const driver = await Driver.create({
      name: app.name,
      email: app.email,
      password: hashed,
      phone: app.phone,
      ngoId: app.ngoId,
      capacity: app.capacity,
      location: app.location,
    });

    await DriverApplication.findByIdAndUpdate(app._id, {
      status: "approved",
      driverId: driver._id,
    });

    res.status(200).json({
      message: "Driver approved successfully.",
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve application." });
  }
};

// ── PUT /reject/:id ───────────────────────────────────────
const rejectApplication = async (req, res) => {
  try {
    const { reason } = req.body;

    const app = await DriverApplication.findOneAndUpdate(
      { _id: req.params.id, ngoId: req.user._id },
      { status: "rejected", rejectionReason: reason || "" },
      { new: true }
    );

    if (!app) return res.status(404).json({ message: "Application not found." });

    res.status(200).json({ message: "Application rejected.", application: app });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject application." });
  }
};

// ── GET /status/:email ────────────────────────────────────
const getApplicationStatus = async (req, res) => {
  try {
    const app = await DriverApplication.findOne({ email: req.params.email })
      .populate("ngoId", "name ngoName");

    if (!app) return res.status(404).json({ message: "No application found." });

    res.status(200).json({
      status: app.status,
      ngoName: app.ngoId?.ngoName || app.ngoId?.name,
      submittedAt: app.createdAt,
      rejectionReason: app.rejectionReason || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch status." });
  }
};

// ── EXPORT ────────────────────────────────────────────────
module.exports = {
  getNearbyNgos,
  submitApplication,
  getApplications,
  approveApplication,
  rejectApplication,
  getApplicationStatus,
};