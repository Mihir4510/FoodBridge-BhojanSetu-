const Donation = require("../models/donation.model");
const uploadFile = require("../services/storage.services");


// Create Donation (Donor or Restaurant)
async function createDonation(req, res) {
    try {
        const { type, quantity, description, organizationId } = req.body;

        let imageData = {};

        // If image exists, upload to ImageKit
        if (req.file) {
            const uploadedImage = await uploadFile(
                req.file.buffer,
                req.file.originalname
            );

            imageData = {
                url: uploadedImage.url,
                fileId: uploadedImage.fileId
            };
        }

        const donation = await Donation.create({
            donorId: req.user._id,
            organizationId,
            type,
            quantity,
            description,
            image: imageData || undefined
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
        const donation = await Donation.findOne({
            _id: req.params.id,
            organizationId: req.user._id,
            status: "pending"
        });

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found or already accepted"
            });
        }

        donation.status = "accepted";
        donation.acceptedAt = new Date();
        donation.acceptedBy = req.user._id;

        await donation.save();

        res.status(200).json({ success: true, donation });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Collect Donation
async function collectDonation(req, res) {
    try {
        const donation = await Donation.findOne({
            _id: req.params.id,
            organizationId: req.user._id,
            status: "accepted"
        });

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found or not accepted yet"
            });
        }

        donation.status = "collected";
        donation.collectedAt = new Date();

        await donation.save();

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