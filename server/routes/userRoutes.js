import express from "express";
import {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize("Admin"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id/role", updateUserRole);
router.put("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

export default router;
