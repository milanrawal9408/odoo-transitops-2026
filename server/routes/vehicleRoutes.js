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
  authorize("Admin", "Fleet Manager"),
  createVehicle
);

router.get("/", protect, getVehicles);

router.get("/:id", protect, getVehicleById);

router.put(
  "/:id",
  protect,
  authorize("Admin", "Fleet Manager"),
  updateVehicle
);

router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteVehicle
);

export default router;