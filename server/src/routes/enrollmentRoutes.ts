
import { Router } from "express";
import {
  createEnrollment,
  fetchMyEnrollments,
  fetchAllEnrollments,
} from "../controllers/EnrollmentController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { authorizePermissions } from "../middlewares/authorizePermissions";
import { UserRole } from "../entities/User";

const router = Router();

// Student: Create enrollment
router.post(
  "/",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  createEnrollment
);

// Admin: View all enrollments
router.get(
  "/",
  authMiddleware,
  authorizePermissions("enrollments.view"),
  fetchAllEnrollments
);

// Student: View own enrollments
router.get(
  "/my",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchMyEnrollments
);

export default router;
