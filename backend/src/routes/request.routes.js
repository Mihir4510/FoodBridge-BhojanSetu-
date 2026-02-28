import express from "express";
import { createRequest, approveRequest } from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRequest);
router.put("/approve/:id", protect, approveRequest);

export default router;