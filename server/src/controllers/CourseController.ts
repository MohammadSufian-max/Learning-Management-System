
import { Request, Response } from "express";
import {
  createCourse,
  getCourses,
  getPublishedCourses,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
} from "../services/CourseService";
import { CourseLevel, CourseStatus } from "../entities/Course";
import { UserRole } from "../entities/User";


export const addCourse = async (req: Request, res: Response) => {
  try {
    const {
      courseTitle,
      courseCode,
      description,
      thumbnail,
      category,
      level,
      duration,
    } = req.body;

    if (
      !courseTitle ||
      !courseCode ||
      !description ||
      !category ||
      !level ||
      duration === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!Object.values(CourseLevel).includes(level)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course level",
      });
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive integer",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const instructorId =
  req.user.role === UserRole.ADMIN
    ? Number(req.body.instructorId)
    : req.user.id;

if (!Number.isInteger(instructorId) || instructorId <= 0) {
  return res.status(400).json({
    success: false,
    message: "A valid instructor must be assigned",
  });
}

    const course = await createCourse(
  {
    courseTitle,
    courseCode,
    description,
    thumbnail,
    category,
    level,
    duration,
  },
  instructorId
);

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Course creation failed";

    const status =
      message === "Active instructor not found" ? 404 :
      message === "Course code already exists" ? 409 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const fetchCourses = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const courses = await getCourses(req.user.role, req.user.id);

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

export const fetchPublishedCourses = async (
  req: Request,
  res: Response
) => {
  try {
    const courses = await getPublishedCourses();

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch published courses",
    });
  }
};

export const editCourse = async (req: Request, res: Response) => {
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
        message: "Invalid course ID",
      });
    }

    const course = await updateCourse(
      id,
      req.user.id,
      req.user.role,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Course update failed";

    const status =
      message === "Course not found" ? 404 :
      message === "Course code already exists" ? 409 :
      message === "You cannot update this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};



export const changeCourseStatus = async (
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
        message: "Invalid course ID",
      });
    }

    if (!Object.values(CourseStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course status",
      });
    }

    const course = await updateCourseStatus(
      id,
      req.user.id,
      req.user.role,
      status
    );

    return res.status(200).json({
      success: true,
      message: "Course status updated successfully",
      data: course,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Status update failed";

    const statusCode =
      message === "Course not found" ? 404 :
      message === "You cannot update this course" ? 403 : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};



export const removeCourse = async (req: Request, res: Response) => {
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
        message: "Invalid course ID",
      });
    }

    await deleteCourse(id, req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Course deletion failed";

    const status =
      message === "Course not found" ? 404 :
      message === "You cannot delete this course" ? 403 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};
