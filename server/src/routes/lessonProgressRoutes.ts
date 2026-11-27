
import { Router } from "express";
import {
  completeLesson,
  fetchCourseProgress,
} from "../controllers/LessonProgressController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { authorizePermissions } from "../middlewares/authorizePermissions";
import { UserRole } from "../entities/User";

const router = Router();

// Student: Complete lesson - preserve existing access
router.patch(
  "/lesson/:lessonId/complete",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  completeLesson
);

// Student: View own course progress
router.get(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchCourseProgress
);

export default router;
