import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserActivities,
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("Admin"));

router
  .route("/")
  .get(getUsers)
  .post(createUser);

router
  .route("/activities/log")
  .get(getUserActivities);

router
  .route("/:id")
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router
  .route("/:id/role")
  .patch(updateUserRole);

router
  .route("/:id/status")
  .patch(updateUserStatus);

export default router;