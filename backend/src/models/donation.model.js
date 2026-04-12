// backend/models/Donation.js
// STATUS FLOW: pending → accepted → assigned → picked_up → completed → expired

const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, "Food title is required"],
      trim:     true,
    },
    foodType: {
      type:    String,
      enum:    ["Food", "Grocery"],
      default: "Food",
    },
    quantity: {
      type:     Number,
      required: true,
    },
    unit: {
      type:    String,
      enum:    ["plates", "kg", "litres", "boxes"],
      default: "plates",
    },
    pickupAddress: {
      type:     String,
      required: true,
    },
    contactNumber: {
      type:     String,
      required: true,
    },
    notes:      String,
    expiryTime: {
      type:     Date,
      required: true,
    },
    priority: {
      type:    String,
      enum:    ["high", "medium", "low"],
      default: "low",
    },

    // pending → accepted → assigned → picked_up → completed → expired
    status: {
      type:    String,
      enum:    ["pending", "accepted", "assigned", "picked_up", "completed", "expired"],
      default: "pending",
    },

    // Who donated
    donorId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    // Which NGO accepted
    organizationId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "User",
      default: null,
    },

    // Which driver is assigned (null = not yet assigned)
    // Atomic update prevents double-assignment (concurrency safe)
    driverId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Driver",
      default: null,
    },

    assignedAt:  { type: Date, default: null },
    pickedUpAt:  { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
