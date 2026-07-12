import express from "express";
import {
  getAllMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  completeMaintenance,
  deleteMaintenance,
} from "../controllers/maintenanceController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET all records & Create
router.get("/", protect, authorize("Admin", "Fleet Manager", "Safety Officer"), getAllMaintenances);
router.post(
  "/",
  protect,
  authorize("Admin", "Fleet Manager", "Safety Officer"),
  createMaintenance
);

// GET single, Update, Delete
router.get("/:id", protect, authorize("Admin", "Fleet Manager", "Safety Officer"), getMaintenanceById);

// We need updateMaintenance to handle PUT
router.put(
  "/:id",
  protect,
  authorize("Admin", "Fleet Manager", "Safety Officer"),
  updateMaintenance
);

// Mark Complete
router.patch(
  "/:id/complete",
  protect,
  authorize("Admin", "Fleet Manager", "Safety Officer"),
  completeMaintenance
);

// Delete
router.delete(
  "/:id",
  protect,
  authorize("Admin", "Fleet Manager", "Safety Officer"),
  deleteMaintenance
);


export default router;
