import { Request, Response } from "express";
import {
  markLessonCompleted,
  getCourseProgress,
} from "../services/LessonProgressService";

export const completeLesson = async (
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

    const lessonId = Number(req.params.lessonId);

    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    const progress = await markLessonCompleted(
      req.user.id,
      lessonId
    );

    return res.status(200).json({
      success: true,
      message: "Lesson marked as completed",
      data: progress,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to complete lesson";

    const status =
      message === "Lesson not found" ? 404 :
      message === "Active enrollment required" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const fetchCourseProgress = async (
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

    const courseId = Number(req.params.courseId);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const progress = await getCourseProgress(
      req.user.id,
      courseId
    );

    return res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch progress";

    const status =
      message === "Active enrollment required" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};