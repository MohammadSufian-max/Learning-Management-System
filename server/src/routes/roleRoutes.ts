
import { Router } from "express";
import {
  addRole,
  fetchRoles,
  fetchPermissions,
  editRole,
  removeRole,
} from "../controllers/RoleController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { UserRole } from "../entities/User";

const router = Router();

router.use(authMiddleware, authorizeRoles(UserRole.ADMIN));

router.post("/", addRole);
router.get("/", fetchRoles);
router.get("/permissions", fetchPermissions);
router.put("/:id", editRole);
router.delete("/:id", removeRole);

export default router;
