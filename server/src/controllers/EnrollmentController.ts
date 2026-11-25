
import { Request, Response } from "express";
import {
  enrollStudent,
  getMyEnrollments,
  getAllEnrollments,
} from "../services/EnrollmentService";

export const createEnrollment = async (
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

    const courseId = Number(req.body.courseId);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const enrollment = await enrollStudent(
      req.user.id,
      courseId
    );

    return res.status(201).json({
      success: true,
      message: "Course enrollment successful",
      data: enrollment,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Enrollment failed";

    const status =
      message === "Published course not found" ? 404 :
      message === "Already enrolled in this course" ? 409 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const fetchMyEnrollments = async (
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

    const enrollments = await getMyEnrollments(req.user.id);

    return res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
    });
  }
};

// Admin: Fetch all student enrollments
export const fetchAllEnrollments = async (
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

    const enrollments = await getAllEnrollments();

    return res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all enrollments",
    });
  }
};
