const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donation.controller");
const protect = require("../middleware/protect.middleware");
const authorizeRoles = require("../middleware/authorize.middleware");
const checkApproval = require("../middleware/approval.middleware");
const upload = require("../middleware/upload.middleware");

// Donor/Restaurant creates donation
router.post(
    "/create",
    protect,
    upload.single("image"),
    checkApproval,
    authorizeRoles("individual", "restaurant"),
    donationController.createDonation
);

// Donor/Restaurant views donations
router.get(
    "/my-donations",
     protect,
    authorizeRoles("individual", "restaurant"),
    donationController.getDonorDonations
);

// Organization views requests
router.get(
    "/requests",
    protect,
    authorizeRoles("organization"),
    checkApproval,
    donationController.getOrganizationRequests
);

// Organization accepts donation
router.put(
    "/accept/:id",
    protect,
    authorizeRoles("organization"),
    checkApproval,
    donationController.acceptDonation
);

// Organization collects donation
router.put(
    "/collect/:id",
    protect,
    authorizeRoles("organization"),
    checkApproval,
    donationController.collectDonation
);

module.exports = router;