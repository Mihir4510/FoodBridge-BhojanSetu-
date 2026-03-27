const mongoose = require("mongoose");

const donationSchema = mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // IMPORTANT (not required at start)
    },

    
    title: {
      type: String,
      required: true,
    },

    foodType: {
      type: String,
      enum: ["Food", "Grocery"],
      required: true,
    },

    quantity: {
      type: Number,   
      required: true,
    },

    unit: {
      type: String,
      default: "plates",
    },

    pickupAddress: {
      type: String,
      required: true,
    },

    expiryTime: {
      type: Date,
      required: true,
    },

    contactNumber: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
    },

    // OLD fields (keep if needed)
    image: {
      url: String,
      fileId: String,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "collected", "expired"],
      default: "pending",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    acceptedAt: Date,
    collectedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);