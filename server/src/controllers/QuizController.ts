
import { Request, Response } from "express";
import {
  createQuiz,
  getQuizzesByCourse,
  updateQuiz,
  updateQuizStatus,
  deleteQuiz,
} from "../services/QuizService";
import { QuizStatus } from "../entities/Quiz";

export const addQuiz = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      courseId,
      moduleId,
      quizTitle,
      description,
      duration,
      totalMarks,
      passingMarks,
    } = req.body;

    const parsedCourseId = Number(courseId);
    const parsedModuleId =
      moduleId === undefined || moduleId === null || moduleId === ""
        ? null
        : Number(moduleId);

    if (
      !Number.isInteger(parsedCourseId) ||
      parsedCourseId <= 0 ||
      !quizTitle ||
      !Number.isInteger(duration) ||
      duration <= 0 ||
      !Number.isInteger(totalMarks) ||
      totalMarks <= 0 ||
      !Number.isInteger(passingMarks) ||
      passingMarks < 0 ||
      passingMarks > totalMarks ||
      (parsedModuleId !== null &&
        (!Number.isInteger(parsedModuleId) || parsedModuleId <= 0))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz details",
      });
    }

    const quiz = await createQuiz(
      {
        courseId: parsedCourseId,
        moduleId: parsedModuleId,
        quizTitle,
        description,
        duration,
        totalMarks,
        passingMarks,
      },
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Quiz creation failed";

    const status =
      message === "Course not found" ||
      message === "Module not found in this course" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const fetchQuizzes = async (req: Request, res: Response) => {
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

    const quizzes = await getQuizzesByCourse(courseId, req.user.id);

    return res.status(200).json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch quizzes";

    const status =
      message === "Course not found" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const editQuiz = async (req: Request, res: Response) => {
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
        message: "Invalid quiz ID",
      });
    }

    const {
      quizTitle,
      description,
      duration,
      totalMarks,
      passingMarks,
      moduleId,
    } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
      });
    }

    if (
      (duration !== undefined &&
        (!Number.isInteger(duration) || duration <= 0)) ||
      (totalMarks !== undefined &&
        (!Number.isInteger(totalMarks) || totalMarks <= 0)) ||
      (passingMarks !== undefined &&
        (!Number.isInteger(passingMarks) || passingMarks < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz values",
      });
    }

    const quiz = await updateQuiz(id, req.user.id, {
      quizTitle,
      description,
      duration,
      totalMarks,
      passingMarks,
      moduleId,
    });

    if (quiz.passingMarks > quiz.totalMarks) {
      return res.status(400).json({
        success: false,
        message: "Passing marks cannot exceed total marks",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Quiz update failed";

    const status =
      message === "Quiz not found" ||
      message === "Module not found in this course" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const changeQuizStatus = async (
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

    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    if (!Object.values(QuizStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz status",
      });
    }

    const quiz = await updateQuizStatus(
      id,
      req.user.id,
      status
    );

    return res.status(200).json({
      success: true,
      message: "Quiz status updated successfully",
      data: quiz,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Status update failed";

    const statusCode =
      message === "Quiz not found" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const removeQuiz = async (req: Request, res: Response) => {
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
        message: "Invalid quiz ID",
      });
    }

    await deleteQuiz(id, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Quiz deletion failed";

    const status =
      message === "Quiz not found" ? 404 :
      message === "You cannot manage this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};
