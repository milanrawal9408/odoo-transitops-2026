import express from "express";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Placeholder — full maintenance module coming soon
router.get("/", protect, (req, res) => {
  res.status(200).json({ success: true, maintenance: [] });
});

export default router;
