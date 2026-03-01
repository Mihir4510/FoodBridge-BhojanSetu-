const Donation = require("../models/donation.model");

// Create Donation (Donor or Restaurant)
async function createDonation(req, res) {
    try {
        const { type, quantity, description, organizationId, image } = req.body;

        const donation = await Donation.create({
            donorId: req.user._id,
            organizationId,
            type,
            quantity,
            description,
            image
        });

        res.status(201).json({ success: true, donation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Donor/Restaurant Donations
async function getDonorDonations(req, res) {
    try {
        const donations = await Donation.find({ donorId: req.user._id })
            .populate("organizationId", "name email");

        res.status(200).json({ success: true, donations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Organization Requests
async function getOrganizationRequests(req, res) {
    try {
        const requests = await Donation.find({ organizationId: req.user._id, status: "pending" })
            .populate("donorId", "name email role");

        res.status(200).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Accept Donation
async function acceptDonation(req, res) {
    try {
        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            { status: "accepted" },
            { new: true }
        );
        res.status(200).json({ success: true, donation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Collect Donation
async function collectDonation(req, res) {
    try {
        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            { status: "collected" },
            { new: true }
        );
        res.status(200).json({ success: true, donation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    createDonation,
    getDonorDonations,
    getOrganizationRequests,
    acceptDonation,
    collectDonation
};