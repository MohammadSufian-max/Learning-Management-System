import { Router } from "express";
import {
  addUser,fetchAllUsers,editUser,disableUser, } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { UserRole } from "../entities/User";
import { enableUser } from "../controllers/UserController";

const router = Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN),
  addUser
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN),
  fetchAllUsers
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN),
  editUser
);

router.patch(
  "/:id/deactivate",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN),
  disableUser
);

router.patch(
  "/:id/activate",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN),
  enableUser
);

export default router;