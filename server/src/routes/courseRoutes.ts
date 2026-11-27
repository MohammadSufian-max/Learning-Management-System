
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
import { authorizePermissions } from "../middlewares/authorizePermissions";
import { UserRole } from "../entities/User";

const router = Router();

// Create course
router.post(
  "/",
  authMiddleware,
  authorizePermissions("courses.create"),
  addCourse
);

// Published courses - preserve existing student-only access
router.get(
  "/published",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchPublishedCourses
);

// View courses
router.get(
  "/",
  authMiddleware,
  authorizePermissions("courses.view"),
  fetchCourses
);

// Edit course
router.put(
  "/:id",
  authMiddleware,
  authorizePermissions("courses.edit"),
  editCourse
);

// Change course status
router.patch(
  "/:id/status",
  authMiddleware,
  authorizePermissions("courses.edit"),
  changeCourseStatus
);

// Delete course
router.delete(
  "/:id",
  authMiddleware,
  authorizePermissions("courses.delete"),
  removeCourse
);

export default router;
