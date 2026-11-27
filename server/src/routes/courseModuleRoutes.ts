
import { Router } from "express";
import {
  addModule,
  fetchModules,
  fetchStudentModules,
  editModule,
  removeModule,
} from "../controllers/CourseModuleController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { authorizePermissions } from "../middlewares/authorizePermissions";
import { UserRole } from "../entities/User";

const router = Router();

// Create module
router.post(
  "/",
  authMiddleware,
  authorizePermissions("course_modules.create"),
  addModule
);

// Student modules - preserve existing student access
router.get(
  "/student/:courseId",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchStudentModules
);

// Fetch modules
router.get(
  "/:courseId",
  authMiddleware,
  authorizePermissions("course_modules.view"),
  fetchModules
);

// Edit module
router.put(
  "/:id",
  authMiddleware,
  authorizePermissions("course_modules.edit"),
  editModule
);

// Delete module
router.delete(
  "/:id",
  authMiddleware,
  authorizePermissions("course_modules.delete"),
  removeModule
);

export default router;
