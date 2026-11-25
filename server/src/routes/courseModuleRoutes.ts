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
import { UserRole } from "../entities/User";

const router = Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles(UserRole.INSTRUCTOR),
  addModule
);

router.get(
  "/student/:courseId",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchStudentModules
);

router.get(
  "/:courseId",
  authMiddleware,
  authorizeRoles(UserRole.INSTRUCTOR),
  fetchModules
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.INSTRUCTOR),
  editModule
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.INSTRUCTOR),
  removeModule
);

export default router;