const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect.middleware.js");

const {
  getNearbyNgos,
  submitApplication,
  getApplications,
  approveApplication,
  rejectApplication,
  getApplicationStatus,
} = require("../controllers/driverApplicationController.js");

// ── Public routes ─────────────────────────────
router.get("/nearby-ngos", getNearbyNgos);
router.post("/apply", submitApplication);
router.get("/status/:email", getApplicationStatus);

// ── NGO protected routes ─────────────────────
router.get("/applications", protect, getApplications);
router.put("/approve/:id", protect, approveApplication);
router.put("/reject/:id", protect, rejectApplication);

module.exports = router;