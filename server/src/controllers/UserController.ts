
import { Request, Response } from "express";
import {
  createUser,
  getAllUsers,
  updateUser,
  deactivateUser,
  activateUser,
} from "../services/UserService";
import { UserRole, UserStatus } from "../entities/User";

export const addUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, mobileNumber, password, role, profileImage } =
      req.body;

    if (!fullName || !email || !mobileNumber || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const user = await createUser({
      fullName,
      email,
      mobileNumber,
      password,
      role,
      profileImage,
    });

    const { password: _, ...safeUser } = user;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: safeUser,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "User creation failed";

    return res.status(message === "Email already exists" ? 409 : 500).json({
      success: false,
      message,
    });
  }
};

export const fetchAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, role, status } = req.query;

    if (role && !Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    if (status && !Object.values(UserStatus).includes(status as UserStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user status",
      });
    }

    const users = await getAllUsers({
      search: typeof search === "string" ? search.trim() : undefined,
      role: role as UserRole | undefined,
      status: status as UserStatus | undefined,
    });

    const safeUsers = users.map(({ password, ...user }) => user);

    return res.status(200).json({
      success: true,
      data: safeUsers,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};


export const editUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const { fullName, email, mobileNumber, role, profileImage } = req.body;

    if (role && !Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const user = await updateUser(id, {
      fullName,
      email,
      mobileNumber,
      role,
      profileImage,
    });

    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: safeUser,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    const status = message === "User not found" ? 404 :
      message === "Email already exists" ? 409 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const disableUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await deactivateUser(id);

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deactivation failed";

    return res.status(message === "User not found" ? 404 : 500).json({
      success: false,
      message,
    });
  }
};

export const enableUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await activateUser(id);
    const { password, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: "User activated successfully",
      data: safeUser,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "Failed to activate user",
    });
  }
};