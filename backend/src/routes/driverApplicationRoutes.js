const express = require("express");
const protect = require("../middleware/protect.middleware");
const {
  getNearbyNgos, submitApplication, getApplications,
  approveApplication, rejectApplication, getApplicationStatus,
} = require("../controllers/driverApplicationController");

const router = express.Router();

// ── Public (no login needed) ──────────────────────────────
router.get("/nearby-ngos",     getNearbyNgos);
router.post("/apply",          submitApplication);
router.get("/status/:email",   getApplicationStatus);

// ── NGO protected ─────────────────────────────────────────
router.get("/applications",    protect, getApplications);
router.put("/approve/:id",     protect, approveApplication);
router.put("/reject/:id",      protect, rejectApplication);

module.exports = router;