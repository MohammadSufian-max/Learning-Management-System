
import { AppDataSource } from "../config/database";
import { CourseModule } from "../entities/CourseModule";
import { Course } from "../entities/Course";
import { verifyActiveEnrollment } from "./EnrollmentService";

export const createModule = async (
  data: {
    courseId: number;
    moduleTitle: string;
    description?: string;
    sequenceNumber: number;
  },
  instructorId: number
) => {
  const courseRepository = AppDataSource.getRepository(Course);
  const moduleRepository = AppDataSource.getRepository(CourseModule);

  const course = await courseRepository.findOneBy({
    id: data.courseId,
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.instructorId !== instructorId) {
    throw new Error("You cannot manage this course");
  }

  const courseModule = moduleRepository.create({
    courseId: data.courseId,
    moduleTitle: data.moduleTitle,
    description: data.description ?? null,
    sequenceNumber: data.sequenceNumber,
  });

  return await moduleRepository.save(courseModule);
};

export const getModulesByCourse = async (
  courseId: number,
  instructorId: number
) => {
  const courseRepository = AppDataSource.getRepository(Course);
  const moduleRepository = AppDataSource.getRepository(CourseModule);

  const course = await courseRepository.findOneBy({
    id: courseId,
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.instructorId !== instructorId) {
    throw new Error("You cannot manage this course");
  }

  return await moduleRepository.find({
    where: { courseId },
    order: { sequenceNumber: "ASC" },
  });
};

export const updateModule = async (
  id: number,
  instructorId: number,
  data: {
    moduleTitle?: string;
    description?: string;
    sequenceNumber?: number;
  }
) => {
  const moduleRepository = AppDataSource.getRepository(CourseModule);

  const courseModule = await moduleRepository.findOne({
    where: { id },
    relations: { course: true },
  });

  if (!courseModule) {
    throw new Error("Module not found");
  }

  if (courseModule.course.instructorId !== instructorId) {
    throw new Error("You cannot manage this course");
  }

  Object.assign(courseModule, data);

  return await moduleRepository.save(courseModule);
};


export const deleteModule = async (
  id: number,
  instructorId: number
) => {
  const moduleRepository = AppDataSource.getRepository(CourseModule);

  const courseModule = await moduleRepository.findOne({
    where: { id },
    relations: { course: true },
  });

  if (!courseModule) {
    throw new Error("Module not found");
  }

  if (courseModule.course.instructorId !== instructorId) {
    throw new Error("You cannot manage this course");
  }

  await moduleRepository.remove(courseModule);

  return true;
};

export const getStudentModules = async (
  courseId: number,
  studentId: number
) => {
  const courseRepository = AppDataSource.getRepository(Course);
  const moduleRepository = AppDataSource.getRepository(CourseModule);

  const course = await courseRepository.findOneBy({
    id: courseId,
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const enrollment = await verifyActiveEnrollment(studentId, courseId);

  if (!enrollment) {
    throw new Error("Active enrollment required");
  }

  return await moduleRepository.find({
    where: { courseId },
    order: { sequenceNumber: "ASC" },
  });
};