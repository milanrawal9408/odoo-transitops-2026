import express from "express";
import { chatWithAssistant } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/chat",
  protect,
  authorize("Admin", "Fleet Manager"),
  chatWithAssistant
);

export default router;
