import express from "express";
import {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  getDriverUsers,
} from "../controllers/driverController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET all users with Driver role (no existing profile) — for dropdown
router.get("/driver-users", protect, getDriverUsers);

// CRUD
router.post(
  "/",
  protect,
  authorize("Admin", "Fleet Manager"),
  createDriver
);

router.get("/", protect, getDrivers);

router.get("/:id", protect, getDriverById);

router.put(
  "/:id",
  protect,
  authorize("Admin", "Fleet Manager"),
  updateDriver
);

router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteDriver
);

export default router;
