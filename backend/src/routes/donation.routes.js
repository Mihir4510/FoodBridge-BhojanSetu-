import express from "express";
import { createDonation, getAvailableDonations, markCollected } from "../controllers/donationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createDonation);
router.get("/", protect, getAvailableDonations);
router.put("/collect/:id", protect, markCollected);

export default router;