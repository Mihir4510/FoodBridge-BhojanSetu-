const User = require("../models/user.model");
const Donation = require("../models/donation.model");

// Pending Users
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["restaurant", "organization"] },
      isApproved: false,
    }).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve User
const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "individual") {
      return res.status(400).json({
        message: "Individuals are auto-approved",
      });
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.role} approved successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject User
const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User rejected and deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// All Donations
const getAllDonations = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const donations = await Donation.find(filter)
      .populate("donorId", "name email role")
      .populate("organizationId", "name email");

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalIndividuals = await User.countDocuments({ role: "individual" });
    const totalRestaurants = await User.countDocuments({ role: "restaurant" });
    const totalOrganizations = await User.countDocuments({ role: "organization" });

    const pendingApprovals = await User.countDocuments({
      role: { $in: ["restaurant", "organization"] },
      isApproved: false,
    });

    const totalDonations = await Donation.countDocuments();
    const pendingDonations = await Donation.countDocuments({ status: "pending" });
    const acceptedDonations = await Donation.countDocuments({ status: "accepted" });
    const collectedDonations = await Donation.countDocuments({ status: "collected" });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalIndividuals,
        totalRestaurants,
        totalOrganizations,
        pendingApprovals,
        totalDonations,
        pendingDonations,
        acceptedDonations,
        collectedDonations,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  getAllDonations,
  getDashboardStats,
};