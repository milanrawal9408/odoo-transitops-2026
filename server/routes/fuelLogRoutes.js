import express from "express";
import {
  getFuelLogs,
  getFuelLogById,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog,
} from "../controllers/fuelLogController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getFuelLogs);

router.get("/:id", protect, getFuelLogById);

router.post(
  "/",
  protect,
  authorize("Admin", "Fleet Manager"),
  createFuelLog
);

router.put(
  "/:id",
  protect,
  authorize("Admin", "Fleet Manager"),
  updateFuelLog
);

router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteFuelLog
);

export default router;
