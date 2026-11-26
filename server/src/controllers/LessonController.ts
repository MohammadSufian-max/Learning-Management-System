
import { Request, Response } from "express";
import {
  createLesson,
  getLessonsByModule,
  getStudentLessonsByModule,
  updateLesson,
  deleteLesson,
} from "../services/LessonService";
import { LessonType } from "../entities/Lesson";

export const addLesson = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      moduleId,
      lessonTitle,
      lessonType,
      contentUrl,
      textContent,
      description,
      duration,
      sequenceNumber,
    } = req.body;

    if (
      !moduleId ||
      !lessonTitle ||
      !lessonType ||
      duration === undefined ||
      sequenceNumber === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const parsedModuleId = Number(moduleId);
    const parsedDuration = Number(duration);
    const parsedSequenceNumber = Number(sequenceNumber);

    if (!Object.values(LessonType).includes(lessonType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson type",
      });
    }

    if (
      !Number.isInteger(parsedModuleId) ||
      parsedModuleId <= 0 ||
      !Number.isInteger(parsedDuration) ||
      parsedDuration < 0 ||
      !Number.isInteger(parsedSequenceNumber) ||
      parsedSequenceNumber <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID, duration or sequence number",
      });
    }

    const uploadedFile = req.file;

    if (
      (lessonType === LessonType.VIDEO ||
        lessonType === LessonType.PDF) &&
      !uploadedFile
    ) {
      return res.status(400).json({
        success: false,
        message: "Video or PDF file is required",
      });
    }

    if (
      uploadedFile &&
      (
        (lessonType === LessonType.VIDEO &&
          !uploadedFile.mimetype.startsWith("video/")) ||
        (lessonType === LessonType.PDF &&
          uploadedFile.mimetype !== "application/pdf") ||
        lessonType === LessonType.TEXT
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Uploaded file does not match lesson type",
      });
    }

    const finalContentUrl = uploadedFile
      ? `/uploads/${uploadedFile.filename}`
      : contentUrl;

    const lesson = await createLesson(
      {
        moduleId: parsedModuleId,
        lessonTitle,
        lessonType,
        contentUrl: finalContentUrl,
        textContent,
        description,
        duration: parsedDuration,
        sequenceNumber: parsedSequenceNumber,
      },
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: lesson,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Lesson creation failed";

    const status =
      message === "Module not found" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const fetchLessons = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const moduleId = Number(req.params.moduleId);

    if (!Number.isInteger(moduleId) || moduleId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const lessons = await getLessonsByModule(moduleId, req.user.id);

    return res.status(200).json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch lessons";

    const status =
      message === "Module not found" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const editLesson = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    const {
      lessonTitle,
      lessonType,
      contentUrl,
      textContent,
      description,
      duration,
      sequenceNumber,
    } = req.body;

    const uploadedFile = req.file;

    if (Object.keys(req.body).length === 0 && !uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
      });
    }

    if (
      lessonType !== undefined &&
      !Object.values(LessonType).includes(lessonType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson type",
      });
    }

    if (
      uploadedFile &&
      (
        (lessonType === LessonType.VIDEO &&
          !uploadedFile.mimetype.startsWith("video/")) ||
        (lessonType === LessonType.PDF &&
          uploadedFile.mimetype !== "application/pdf") ||
        lessonType === LessonType.TEXT
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Uploaded file does not match lesson type",
      });
    }

    if (
      (duration !== undefined &&
        (!Number.isInteger(Number(duration)) || Number(duration) < 0)) ||
      (sequenceNumber !== undefined &&
        (!Number.isInteger(Number(sequenceNumber)) ||
          Number(sequenceNumber) <= 0))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid duration or sequence number",
      });
    }

    const finalContentUrl = uploadedFile
      ? `/uploads/${uploadedFile.filename}`
      : contentUrl;

    const lesson = await updateLesson(id, req.user.id, {
      lessonTitle,
      lessonType,
      contentUrl: finalContentUrl,
      textContent,
      description,
      duration: duration !== undefined ? Number(duration) : undefined,
      sequenceNumber:
        sequenceNumber !== undefined ? Number(sequenceNumber) : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Lesson update failed";

    const status =
      message === "Lesson not found" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const removeLesson = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    await deleteLesson(id, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Lesson deletion failed";

    const status =
      message === "Lesson not found" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const fetchStudentLessons = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const moduleId = Number(req.params.moduleId);

    if (!Number.isInteger(moduleId) || moduleId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const lessons = await getStudentLessonsByModule(
      moduleId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch lessons";

    const status =
      message === "Module not found" ? 404 :
      message === "Active enrollment required" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};
