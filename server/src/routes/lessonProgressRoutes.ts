import { Router } from "express";
import {
  completeLesson,
  fetchCourseProgress,
} from "../controllers/LessonProgressController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { UserRole } from "../entities/User";

const router = Router();

router.patch(
  "/lesson/:lessonId/complete",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  completeLesson
);

router.get(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchCourseProgress
);

export default router;