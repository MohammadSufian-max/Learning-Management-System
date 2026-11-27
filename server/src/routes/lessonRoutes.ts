
import { Router } from "express";
import {
  addLesson,
  fetchLessons,
  fetchStudentLessons,
  editLesson,
  removeLesson,
} from "../controllers/LessonController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { authorizePermissions } from "../middlewares/authorizePermissions";
import { UserRole } from "../entities/User";
import { upload } from "../config/upload";

const router = Router();

// Create lesson
router.post(
  "/",
  authMiddleware,
  authorizePermissions("lessons.create"),
  upload.single("file"),
  addLesson
);

// Student lessons - preserve existing student access
router.get(
  "/student/module/:moduleId",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchStudentLessons
);

// Fetch lessons
router.get(
  "/module/:moduleId",
  authMiddleware,
  authorizePermissions("lessons.view"),
  fetchLessons
);

// Edit lesson
router.put(
  "/:id",
  authMiddleware,
  authorizePermissions("lessons.edit"),
  upload.single("file"),
  editLesson
);

// Delete lesson
router.delete(
  "/:id",
  authMiddleware,
  authorizePermissions("lessons.delete"),
  removeLesson
);

export default router;
