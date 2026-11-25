
import { Request, Response } from "express";
import {
  createQuestion,
  getQuestionsByQuiz,
  getStudentQuestionsByQuiz,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from "../services/QuestionService";
import { QuestionType } from "../entities/Question";

const handleError = (res: Response, error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Something went wrong";

  const status =
    message === "Quiz not found" || message === "Question not found" ? 404 :
    message === "You cannot manage this quiz" ||
    message === "Active course enrollment required" ||
    message === "This quiz is not published" ? 403 :
    message.startsWith("Invalid") ||
    message.includes("requires") ||
    message.includes("correct answer") ||
    message.includes("Question IDs") ? 400 : 500;

  return res.status(status).json({
    success: false,
    message,
  });
};

export const addQuestion = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const quizId = Number(req.params.quizId);

    if (!Number.isInteger(quizId) || quizId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const {
      question,
      questionType,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      marks,
      sequenceNumber,
    } = req.body;

    if (!Object.values(QuestionType).includes(questionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question type",
      });
    }

    const data = {
      question,
      questionType,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      marks: Number(marks),
      sequenceNumber: Number(sequenceNumber),
    };

    const newQuestion = await createQuestion(
      quizId,
      req.user.id,
      data
    );

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: newQuestion,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const fetchQuestions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const quizId = Number(req.params.quizId);

    if (!Number.isInteger(quizId) || quizId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const questions = await getQuestionsByQuiz(
      quizId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Student endpoint: correctAnswer is excluded by the service.
export const fetchStudentQuestions = async (
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

    const quizId = Number(req.params.quizId);

    if (!Number.isInteger(quizId) || quizId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const questions = await getStudentQuestionsByQuiz(
      quizId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const editQuestion = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const questionId = Number(req.params.id);

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
      });
    }

    const data = { ...req.body };

    if (data.marks !== undefined) {
      data.marks = Number(data.marks);
    }

    if (data.sequenceNumber !== undefined) {
      data.sequenceNumber = Number(data.sequenceNumber);
    }

    if (
      data.questionType !== undefined &&
      !Object.values(QuestionType).includes(data.questionType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid question type",
      });
    }

    const updatedQuestion = await updateQuestion(
      questionId,
      req.user.id,
      data
    );

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const removeQuestion = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const questionId = Number(req.params.id);

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    await deleteQuestion(questionId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const changeQuestionOrder = async (
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

    const quizId = Number(req.params.quizId);
    const { questionIds } = req.body;

    if (!Number.isInteger(quizId) || quizId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    if (!Array.isArray(questionIds)) {
      return res.status(400).json({
        success: false,
        message: "Question IDs must be an array",
      });
    }

    const questions = await reorderQuestions(
      quizId,
      req.user.id,
      questionIds.map(Number)
    );

    return res.status(200).json({
      success: true,
      message: "Question order updated successfully",
      data: questions,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
