
const mongoose = require("mongoose");

const donationSchema = mongoose.Schema(
    {
        donorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: ["food", "grocery"],
            required: true
        },
        quantity: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        image: {
            url: String,
            fileId: String
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "collected"],
            default: "pending"
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);