const Donation = require("../models/donation.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

/**
 * @desc Get overall summary for admin dashboard
 */
async function getSummary(req, res) {
  try {
    // Total donations
    const totalDonations = await Donation.countDocuments();

    // Donations by type
    const donationsByType = await Donation.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Donations by status
    const donationsByStatus = await Donation.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Total users
    const totalUsers = await User.countDocuments();
    const totalOrganizations = await User.countDocuments({ role: "organization" });
    const totalRestaurants = await User.countDocuments({ role: "restaurant" });
    const totalIndividuals = await User.countDocuments({ role: "individual" });

    res.status(200).json({
      success: true,
      summary: {
        totalDonations,
        donationsByType,
        donationsByStatus,
        totalUsers,
        totalOrganizations,
        totalRestaurants,
        totalIndividuals,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc Get top donors/restaurants
 */
async function getTopDonors(req, res) {
  try {
    const topDonors = await Donation.aggregate([
      {
        $group: {
          _id: "$donorId",
          totalDonations: { $sum: 1 },
        },
      },
      {
        $sort: { totalDonations: -1 },
      },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "donor",
        },
      },
      {
        $unwind: "$donor",
      },
      {
        $project: {
          _id: 0,
          donorId: "$donor._id",
          name: "$donor.name",
          email: "$donor.email",
          role: "$donor.role",
          totalDonations: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, topDonors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc Get donation trends (weekly/monthly)
 */
async function getDonationTrends(req, res) {
    try {
        // Aggregate donations by week and type
        const trends = await Donation.aggregate([
            {
                $group: {
                    _id: {
                        week: { $week: "$createdAt" },
                        type: "$type"
                    },
                    total: { $sum: 1 }
                }
            },
            { $sort: { "_id.week": 1 } }
        ]);

        // Transform the data to frontend-friendly format
        const formatted = {};
        trends.forEach(item => {
            const week = item._id.week;
            const type = item._id.type;
            if (!formatted[week]) formatted[week] = { week, food: 0, grocery: 0, total: 0 };
            formatted[week][type] = item.total;
            formatted[week].total += item.total;
        });

        res.status(200).json({
            success: true,
            trends: Object.values(formatted)
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


/**
 * @desc Get urgent/high-priority donations
 */
async function getUrgentDonations(req, res) {
  try {
    const now = new Date();

    const donations = await Donation.find({ status: "pending" });

    const urgentDonations = donations.map((donation) => {
      const ageInHours = (now - donation.createdAt) / (1000 * 60 * 60);
      let priority = "normal";
      if (ageInHours >= 4) priority = "high";
      else if (ageInHours >= 2) priority = "medium";

      return { ...donation.toObject(), priority };
    });

    res.status(200).json({ success: true, urgentDonations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc Get all coordinates for map visualization
 */
async function getLocations(req, res) {
  try {
    const donations = await Donation.find({}, "location donorId organizationId");
    const organizations = await User.find({ role: "organization" }, "location name");

    res.status(200).json({ success: true, donations, organizations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc Average collection time (accepted → collected)
 */
async function getAverageCollectionTime(req, res) {
  try {
    const donations = await Donation.find({ acceptedAt: { $exists: true }, collectedAt: { $exists: true } });

    if (!donations.length) {
      return res.status(200).json({ success: true, avgCollectionTimeHours: 0 });
    }

    const totalHours = donations.reduce((sum, donation) => {
      const diff = (donation.collectedAt - donation.acceptedAt) / (1000 * 60 * 60); // hours
      return sum + diff;
    }, 0);

    const avgHours = totalHours / donations.length;

    res.status(200).json({ success: true, avgCollectionTimeHours: avgHours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getSummary,
  getTopDonors,
  getDonationTrends,
  getUrgentDonations,
  getLocations,
  getAverageCollectionTime,
};