
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { Role } from "../entities/Role";
import { UserRole } from "../entities/User";

export const authorizePermissions = (...requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // ADMIN always has full access
      if (req.user.role === UserRole.ADMIN) {
        return next();
      }

      const roleRepository = AppDataSource.getRepository(Role);

      const roles = await roleRepository
        .createQueryBuilder("role")
        .innerJoin("role.users", "user")
        .leftJoinAndSelect("role.permissions", "permission")
        .where("user.id = :userId", { userId: req.user.id })
        .getMany();

      const userPermissions = new Set(
        roles.flatMap((role) =>
          (role.permissions || []).map((permission) => permission.name)
        )
      );

      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.has(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "You do not have the required permissions",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
