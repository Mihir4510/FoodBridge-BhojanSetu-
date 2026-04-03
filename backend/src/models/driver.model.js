

const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    // Which NGO this driver belongs to
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Driver's current location (GeoJSON)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      city: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // How much food (in kg/plates) this driver can carry
    capacity: {
      type: Number,
      required: true,
      default: 50,
    },
    // Track assignments
    currentDonationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      default: null,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 2dsphere index for geo queries
driverSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Driver", driverSchema);
