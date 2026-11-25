import { Router } from "express";
import {
  addCourse,
  fetchCourses,
  fetchPublishedCourses,
  editCourse,
  changeCourseStatus,
  removeCourse,
} from "../controllers/CourseController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { UserRole } from "../entities/User";

const router = Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.INSTRUCTOR),
  addCourse
);

router.get(
  "/published",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchPublishedCourses
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.INSTRUCTOR),
  fetchCourses
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.INSTRUCTOR),
  editCourse
);

router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.INSTRUCTOR),
  changeCourseStatus
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.INSTRUCTOR),
  removeCourse
);

export default router;