// backend/models/Donation.js
// UPDATED — added driverId field and new statuses
// STATUS FLOW: pending → accepted → assigned → picked_up → completed

import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Food title is required"],
      trim: true,
    },
    foodType: {
      type: String,
      enum: ["Food", "Grocery"],
      default: "Food",
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["plates", "kg", "litres", "boxes"],
      default: "plates",
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    notes: String,
    expiryTime: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },

    // ── Status lifecycle ──────────────────────────────
    // pending   → just created
    // accepted  → NGO accepted it
    // assigned  → driver assigned by system
    // picked_up → driver picked up the food
    // completed → food delivered to NGO
    // expired   → past expiry time, not collected
    status: {
      type: String,
      enum: ["pending", "accepted", "assigned", "picked_up", "completed", "expired"],
      default: "pending",
    },

    // Who donated
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which NGO accepted
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── NEW: Which driver is assigned ────────────────
    // null = not yet assigned
    // Set atomically to prevent double-assignment
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },

    // When driver was assigned
    assignedAt: {
      type: Date,
      default: null,
    },

    // When food was picked up by driver
    pickedUpAt: {
      type: Date,
      default: null,
    },

    // When food was delivered to NGO
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);