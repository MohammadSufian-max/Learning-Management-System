
import { Request, Response } from "express";
import {
  createRole,
  getAllRoles,
  getAllPermissions,
  updateRole,
  deleteRole,
} from "../services/RoleService";

export const addRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissionIds } = req.body;

    if (!name || typeof name !== "string" || !Array.isArray(permissionIds)) {
      return res.status(400).json({
        success: false,
        message: "Role name and permission IDs are required",
      });
    }

    if (
      permissionIds.some(
        (id: unknown) => !Number.isInteger(id) || Number(id) <= 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid permission IDs",
      });
    }

    const role = await createRole({
      name,
      description,
      permissionIds,
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Role creation failed";

    return res.status(message === "Role already exists" ? 409 : 400).json({
      success: false,
      message,
    });
  }
};

export const fetchRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await getAllRoles();

    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
    });
  }
};

export const fetchPermissions = async (_req: Request, res: Response) => {
  try {
    const permissions = await getAllPermissions();

    return res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
    });
  }
};

export const editRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    const role = await updateRole(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Role update failed";

    const status =
      message === "Role not found" ? 404 :
      message === "Role already exists" ? 409 : 400;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const removeRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    await deleteRole(id);

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Role deletion failed";

    const status = message === "Role not found" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};
