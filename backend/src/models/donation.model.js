import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  foodType: String,
  quantity: String,
  expiryDate: Date,
  location: String,
  status: {
    type: String,
    enum: ["available", "requested", "completed"],
    default: "available"
  }
}, { timestamps: true });

export default mongoose.model("Donation", donationSchema);