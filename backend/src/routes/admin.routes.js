const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect.middleware");
const authorizeRoles = require("../middleware/authorize.middleware");
const admincontroller = require("../controllers/admin.controller");

// User Management
router.get(
  "/pending-users",
  protect,
  authorizeRoles("admin"),
  admincontroller.getPendingUsers
);

router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  admincontroller.getAllUsers
);

router.put(
  "/approve-user/:userId",
  protect,
  authorizeRoles("admin"),
  admincontroller.approveUser
);

router.put(
  "/reject-user/:userId",
  protect,
  authorizeRoles("admin"),
  admincontroller.rejectUser
);

// Donation Monitoring
router.get(
  "/donations",
  protect,
  authorizeRoles("admin"),
  admincontroller.getAllDonations
);

// Dashboard Analytics
router.get(
  "/dashboard-stats",
  protect,
  authorizeRoles("admin"),
  admincontroller.getDashboardStats
);

module.exports = router;