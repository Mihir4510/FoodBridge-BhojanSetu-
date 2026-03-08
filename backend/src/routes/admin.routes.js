const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect.middleware");
const authorizeRoles = require("../middleware/authorize.middleware");
const adminController = require("../controllers/admin.controller");
const analyticsController = require("../controllers/analytics.controller");

// ---------------- User Management ----------------
router.get(
  "/pending-users",
  protect,
  authorizeRoles("admin"),
  adminController.getPendingUsers
);

router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  adminController.getAllUsers
);

router.put(
  "/approve-user/:userId",
  protect,
  authorizeRoles("admin"),
  adminController.approveUser
);

router.put(
  "/reject-user/:userId",
  protect,
  authorizeRoles("admin"),
  adminController.rejectUser
);

// ---------------- Donation Monitoring ----------------
router.get(
  "/donations",
  protect,
  authorizeRoles("admin"),
  adminController.getAllDonations
);

// ---------------- Dashboard Analytics ----------------
router.get(
  "/dashboard-stats",
  protect,
  authorizeRoles("admin"),
  adminController.getDashboardStats
);

// ---------------- Advanced Analytics Dashboard ----------------
router.get(
  "/analytics/summary",
  protect,
  authorizeRoles("admin"),
  analyticsController.getSummary
);

router.get(
  "/analytics/top-donors",
  protect,
  authorizeRoles("admin"),
  analyticsController.getTopDonors
);

router.get(
  "/analytics/trends",
  protect,
  authorizeRoles("admin"),
  analyticsController.getDonationTrends
);

router.get(
  "/analytics/urgent-donations",
  protect,
  authorizeRoles("admin"),
  analyticsController.getUrgentDonations
);

router.get(
  "/analytics/locations",
  protect,
  authorizeRoles("admin"),
  analyticsController.getLocations
);

router.get(
  "/analytics/avg-collection-time",
  protect,
  authorizeRoles("admin"),
  analyticsController.getAverageCollectionTime
);

module.exports = router;