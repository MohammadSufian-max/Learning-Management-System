
import { Request, Response } from "express";
import {
  startQuizAttempt,
  saveQuizAnswer,
  submitQuizAttempt,
  getMyQuizAttempts,
  getAllMyQuizAttempts,
  getInstructorQuizResults,
} from "../services/QuizAttemptService";

const handleError = (res: Response, error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Something went wrong";

  const statusCode =
    message.includes("not found") ? 404 :
    message.includes("required") ||
    message.includes("Invalid") ||
    message.includes("already") ||
    message.includes("not in progress") ? 400 :
    500;

  return res.status(statusCode).json({ message });
};

export const startAttempt = async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.user?.id);
    const quizId = Number(req.params.quizId);

    const result = await startQuizAttempt(studentId, quizId);

    return res.status(201).json({
      message: "Quiz attempt started successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const saveAnswer = async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.user?.id);
    const attemptId = Number(req.params.attemptId);
    const { questionId, selectedAnswer } = req.body;

    const result = await saveQuizAnswer(
      studentId,
      attemptId,
      Number(questionId),
      selectedAnswer
    );

    return res.status(200).json({
      message: "Answer saved successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const submitAttempt = async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.user?.id);
    const attemptId = Number(req.params.attemptId);

    const result = await submitQuizAttempt(studentId, attemptId);

    return res.status(200).json({
      message: "Quiz submitted and evaluated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const fetchMyAttempts = async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.user?.id);
    const quizId = Number(req.params.quizId);

    const result = await getMyQuizAttempts(studentId, quizId);

    return res.status(200).json({
      message: "Quiz attempts fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


export const fetchAllMyAttempts = async (
  req: Request,
  res: Response
) => {
  try {
    const studentId = Number(req.user?.id);

    const result = await getAllMyQuizAttempts(studentId);

    return res.status(200).json({
      success: true,
      message: "All quiz attempts fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const fetchInstructorQuizResults = async (
  req: Request,
  res: Response
) => {
  try {
    const instructorId = Number(req.user?.id);

    const result = await getInstructorQuizResults(instructorId);

    return res.status(200).json({
      success: true,
      message: "Instructor quiz results fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};