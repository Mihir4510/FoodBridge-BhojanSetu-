const { getIO } = require("../config/socket");
const Donation = require("../models/donation.model");
const uploadFile = require("../services/storage.services");
const User = require("../models/user.model");
const calculatePriority = require("../utils/priorityCalculator");

// Create Donation (Donor or Restaurant)
async function createDonation(req, res) {
  try {
    const { type, quantity, description, organizationId } = req.body;

    let imageData = {};

    // Upload Image to ImageKit
    if (req.file) {
      const uploadedImage = await uploadFile(
        req.file.buffer,
        req.file.originalname,
      );

      imageData = {
        url: uploadedImage.url,
        fileId: uploadedImage.fileId,
      };
    }

    // CHECK donor location exists
    if (!req.user.location || !req.user.location.coordinates) {
      return res.status(400).json({
        success: false,
        message: "User location not found",
      });
    }

    // Get donor location from registered user
    const donorLocation = req.user.location.coordinates;

    // Find nearby organizations within 10km
    const nearbyOrganizations = await User.find({
      role: "organization",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: donorLocation,
          },
          $maxDistance: 1000000000000,
        },
      },
    });

    // CASE 1 → Only one organization nearby
    if (nearbyOrganizations.length === 1) {
      const orgId = nearbyOrganizations[0]._id;

      const donation = await Donation.create({
        donorId: req.user._id,
        organizationId: nearbyOrganizations[0]._id,
        type,
        quantity,
        description,
        image: imageData || undefined,
        location: {
          type: "Point",
          coordinates: donorLocation,
        },
      });
      // SOCKET NOTIFICATION
      const io = getIO();
      console.log("Sending notification to:", orgId);

      io.to(orgId.toString()).emit("newDonation", {
        message: "New donation assigned to you",
      });

      return res.status(201).json({
        success: true,
        message: "Donation automatically assigned to nearest organization",
        donation,
      });
    }

    // CASE 2 → Multiple organizations
    if (nearbyOrganizations.length > 1 && !organizationId) {
      return res.status(200).json({
        success: true,
        message: "Multiple organizations found. Select one.",
        recommended: nearbyOrganizations[0],
        organizations: nearbyOrganizations,
      });
    }

    // CASE 3 → No organization within 10km
    if (nearbyOrganizations.length === 0) {
      const allOrganizations = await User.find({ role: "organization" });

      return res.status(200).json({
        success: true,
        message:
          "No nearby organizations within 10km. Showing nearest available NGOs.",
        organizations: allOrganizations,
      });
    }

    // CREATE DONATION
    const donation = await Donation.create({
      donorId: req.user._id,
      organizationId,
      type,
      quantity,
      description,
      image: imageData || undefined,
      location: {
        type: "Point",
        coordinates: donorLocation,
      },
    });
    // SOCKET NOTIFICATION
    console.log("Sending notification to:", organizationId);

    io.to(organizationId.toString()).emit("newDonation", {
      message: "New donation assigned to you",
    });

    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      donation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
// ------------------------------------------------------------------------------------------------------------------------------

// Get Donor/Restaurant Donations
async function getDonorDonations(req, res) {
  try {
    const donations = await Donation.find({ donorId: req.user._id }).populate(
      "organizationId",
      "name email",
    );

    res.status(200).json({ success: true, donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
// ------------------------------------------------------------------------------------------------------------------------------

// Get Organization Requests
async function getOrganizationRequests(req, res) {
  try {
    const donations = await Donation.find({
      organizationId: req.user._id,
      status: "pending",
    }).populate("donorId", "name email role");

    const requests = donations.map((donation) => {
      const priority = calculatePriority(donation.createdAt);

      return {
        ...donation.toObject(),
        priority,
      };
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// ------------------------------------------------------------------------------------------------------------------------------

// Accept Donation
async function acceptDonation(req, res) {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      organizationId: req.user._id,
      status: "pending",
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found or already accepted",
      });
    }
    //Check if donation expired
    const priority = calculatePriority(donation.createdAt);

    if (priority === "expired") {
      return res.status(400).json({
        success: false,
        message: "Donation expired and cannot be accepted",
      });
    }

    donation.status = "accepted";
    donation.acceptedAt = new Date();
    donation.acceptedBy = req.user._id;

    await donation.save();
    io.to(donation.donorId.toString()).emit("donationAccepted", {
      message: "Your donation has been accepted",
    });

    res.status(200).json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
// ------------------------------------------------------------------------------------------------------------------------------

// Collect Donation
async function collectDonation(req, res) {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      organizationId: req.user._id,
      status: "accepted",
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found or not accepted yet",
      });
    }

    donation.status = "collected";
    donation.collectedAt = new Date();

    await donation.save();
    io.to(donation.donorId.toString()).emit("donationCollected", {
      message: "Your donation has been collected",
    });

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
  collectDonation,
};
