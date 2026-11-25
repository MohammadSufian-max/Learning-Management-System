
import { Request, Response } from "express";
import { getStudentQuizzes } from "../services/StudentQuizService";

export const fetchStudentQuizzes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user?.id;

    if (!studentId || Number.isNaN(studentId)) {
      res.status(401).json({
        success: false,
        message: "Invalid student authentication.",
      });
      return;
    }

    const quizzes = await getStudentQuizzes(studentId);

    res.status(200).json({
      success: true,
      message: "Student quizzes fetched successfully.",
      data: quizzes,
    });
  } catch (error) {
    console.error("Fetch student quizzes error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch student quizzes.",
    });
  }
};
