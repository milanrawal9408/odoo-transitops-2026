import express from "express";
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} from "../controllers/tripController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("Admin", "Fleet Manager"),
  createTrip
);

router.get("/", protect, getTrips);

router.get("/:id", protect, getTripById);

router.put(
  "/:id",
  protect,
  authorize("Admin", "Fleet Manager"),
  updateTrip
);

router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteTrip
);

export default router;