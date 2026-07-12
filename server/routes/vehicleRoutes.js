import express from "express";
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("Admin", "Fleet Manager", "Safety Officer"),
  createVehicle
);

router.get("/", protect, authorize("Admin", "Fleet Manager", "Safety Officer", "Driver"), getVehicles);

router.get("/:id", protect, authorize("Admin", "Fleet Manager", "Safety Officer", "Driver"), getVehicleById);

router.put(
  "/:id",
  protect,
  authorize("Admin", "Fleet Manager", "Safety Officer"),
  updateVehicle
);

router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteVehicle
);

export default router;