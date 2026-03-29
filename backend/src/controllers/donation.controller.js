const { getIO } = require("../config/socket");
const Donation = require("../models/donation.model");
const uploadFile = require("../services/storage.services");
const User = require("../models/user.model");
const calculatePriority = require("../utils/priorityCalculator");


async function createDonation(req, res) {
  try {
    const {
      title,
      foodType,
      quantity,
      unit,
      pickupAddress,
      expiryTime,
      contactNumber,
      notes,
      priority,
      organizationId,
    } = req.body;

    let imageData = {};

    // Upload Image if exists
    if (req.file) {
      const uploadedImage = await uploadFile(req.file.buffer, req.file.originalname);
      imageData = {
        url: uploadedImage.url,
        fileId: uploadedImage.fileId,
      };
    }

    // Check donor location
    if (!req.user.location || !req.user.location.coordinates) {
      return res.status(400).json({ success: false, message: "User location not found" });
    }
    const donorLocation = req.user.location.coordinates;

    // 1️⃣ Find NGOs within 10 km
    let nearbyOrganizations = await User.find({
      role: "organization",
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: donorLocation },
          $maxDistance: 10000, // 10 km
        },
      },
    });

    // 2️⃣ CASE: No nearby NGOs → fallback to all NGOs
    let fallbackUsed = false;
    if (nearbyOrganizations.length === 0) {
      nearbyOrganizations = await User.find({ role: "organization" });
      fallbackUsed = true;
    }

    // Determine finalOrgId
    let finalOrgId = organizationId;

    // 3️⃣ CASE: Exactly 1 NGO → auto assign
    if (nearbyOrganizations.length === 1 && !finalOrgId) {
      finalOrgId = nearbyOrganizations[0]._id;
    }

    // 4️⃣ CASE: Multiple NGOs → send top 3 closest if nearby, else send all
    if (nearbyOrganizations.length > 1 && !finalOrgId) {
      let orgsToSend = nearbyOrganizations;

      if (!fallbackUsed) {
        // nearby orgs → sort by distance and send top 3
        orgsToSend = nearbyOrganizations.slice(0, 3);
      }

      return res.status(200).json({
        success: true,
        message: fallbackUsed
          ? "No nearby NGOs found — showing all registered organizations"
          : "Multiple nearby NGOs found — please select one",
        organizations: orgsToSend,
      });
    }

    // ✅ CREATE donation
    const donation = await Donation.create({
      donorId: req.user._id,
      organizationId: finalOrgId,
      title,
      foodType,
      quantity,
      unit,
      pickupAddress,
      expiryTime,
      contactNumber,
      notes,
      priority,
      image: imageData,
      location: { type: "Point", coordinates: donorLocation },
    });

    // SOCKET notification
    const io = getIO();
    io.to(finalOrgId.toString()).emit("newDonation", { message: "New donation assigned" });

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
      
    }).populate("donorId", "name email role location")
    .populate("organizationId", "name email"); 

const requests = donations.map((donation) => {
  const priority = calculatePriority(donation.createdAt);
  const obj = donation.toObject();

  return {
    ...obj,

    donor: obj.donorId,             
    organization: obj.organizationId, 

    // keep IDs if needed (optional)
    donorId: obj.donorId?._id,
    organizationId: obj.organizationId?._id,

    priority,
  };
});

    res.status(200).json({
      success: true,
      count: requests.length,
      donations: requests, 
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
      
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found or already accepted",
      });
    }

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

    const io = getIO();

    io.to(donation.donorId.toString()).emit("donationAccepted", donation);
    io.to(donation.organizationId.toString()).emit("donationUpdated", donation);

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
    const io = getIO();
    // Notify donor
    io.to(donation.donorId.toString()).emit("donationCollected", donation);

    // Notify NGO dashboard (IMPORTANT)
    io.to(donation.organizationId.toString()).emit("donationUpdated", donation);

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
