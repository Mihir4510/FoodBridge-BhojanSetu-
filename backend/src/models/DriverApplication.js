// backend/models/DriverApplication.js
// STATUS FLOW: pending → approved → rejected
//
// HOW IT CONNECTS:
//   Driver fills /driver/apply form
//   → Saved here with status: "pending"
//   → NGO sees it in their dashboard
//   → NGO approves → Driver model created, login enabled
//   → NGO rejects  → status: "rejected"

const mongoose = require("mongoose");

const driverApplicationSchema = new mongoose.Schema(
  {
    // Personal info
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true },
    phone:       { type: String, required: true },
    city:        { type: String, required: true },
    vehicleType: {
      type:    String,
      enum:    ["bike", "scooter", "auto", "car", "van", "truck"],
      default: "bike",
    },
    capacity:   { type: Number, required: true, default: 30 },
    experience: { type: String, default: "" },

    // Applicant's location (GeoJSON)
    location: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      city:        String,
    },

    // Distance from selected NGO (km) — stored for reference
    distanceFromNgo: { type: Number, default: null },

    // Which NGO the driver applied to
    ngoId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    // Application status
    status: {
      type:    String,
      enum:    ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Optional rejection reason (set by NGO)
    rejectionReason: { type: String, default: "" },

    // Set when approved — points to created Driver document
    driverId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Driver",
      default: null,
    },
  },
  { timestamps: true }
);

driverApplicationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("DriverApplication", driverApplicationSchema);
