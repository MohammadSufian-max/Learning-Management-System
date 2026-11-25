import { Request, Response } from "express";
import {
  createModule,
  getModulesByCourse,
  getStudentModules,
  updateModule,
  deleteModule,
} from "../services/CourseModuleService";

export const addModule = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { courseId, moduleTitle, description, sequenceNumber } = req.body;

    if (!courseId || !moduleTitle || sequenceNumber === undefined) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (
      !Number.isInteger(courseId) ||
      !Number.isInteger(sequenceNumber) ||
      sequenceNumber <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID or sequence number",
      });
    }

    const courseModule = await createModule(
      { courseId, moduleTitle, description, sequenceNumber },
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: courseModule,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Module creation failed";

    const status =
      message === "Course not found" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const fetchModules = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.courseId);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const modules = await getModulesByCourse(courseId, req.user.id);

    return res.status(200).json({
      success: true,
      data: modules,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch modules";

    const status =
      message === "Course not found" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};


export const editModule = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { moduleTitle, description, sequenceNumber } = req.body;

    if (
      sequenceNumber !== undefined &&
      (!Number.isInteger(sequenceNumber) || sequenceNumber <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sequence number",
      });
    }

    const module = await updateModule(id, req.user.id, {
      moduleTitle,
      description,
      sequenceNumber,
    });

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: module,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Module update failed";

    const status =
      message === "Module not found" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};
export const removeModule = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    await deleteModule(id, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Module deletion failed";

    const status =
      message === "Module not found" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};


export const fetchStudentModules = async (
  req: Request,
  res: Response
) => {
  try {
    const courseId = Number(req.params.courseId);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const modules = await getStudentModules(courseId, req.user.id);

    return res.status(200).json({
      success: true,
      data: modules,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch modules";

    const status =
      message === "Course not found" ? 404 :
      message === "Active enrollment required" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};