const express = require("express");
const router = express.Router();
const protectDriver = require("../middleware/driverMiddleware.js");
const protect = require("../middleware/protect.middleware.js");
const {
  registerDriver,
  loginDriver,
  getMyDonations,
  pickupDonation,
  completeDonation,
  getRoute,
  updateLocation,
  getAllDrivers,
} = require("../controllers/driver.Controller.js");



// ── NGO routes (requires NGO login) ──────────────────────
router.post("/register",  protect, registerDriver); // NGO registers a driver
router.get("/all",        protect, getAllDrivers);   // NGO views all their drivers

// ── Driver auth ───────────────────────────────────────────
router.post("/login",     loginDriver);              // Driver logs in

// ── Driver routes (requires driver login) ────────────────
router.get("/my-donations",     protectDriver, getMyDonations);  // see assigned donations
router.put("/pickup/:id",       protectDriver, pickupDonation);  // mark as picked up
router.put("/complete/:id",     protectDriver, completeDonation); // mark as delivered
router.get("/route",            protectDriver, getRoute);         // get optimized route
router.put("/location",         protectDriver, updateLocation);   // update GPS

module.exports=router;
