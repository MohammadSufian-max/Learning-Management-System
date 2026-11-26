
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
import { UserRole } from "../entities/User";
import { upload } from "../config/upload";

const router = Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles(UserRole.INSTRUCTOR),
  upload.single("file"),
  addLesson
);

router.get(
  "/student/module/:moduleId",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchStudentLessons
);

router.get(
  "/module/:moduleId",
  authMiddleware,
  authorizeRoles(UserRole.INSTRUCTOR),
  fetchLessons
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.INSTRUCTOR),
  upload.single("file"),
  editLesson
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.INSTRUCTOR),
  removeLesson
);

export default router;
