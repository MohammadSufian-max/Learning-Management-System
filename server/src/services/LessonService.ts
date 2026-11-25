
import { AppDataSource } from "../config/database";
import { Lesson, LessonType } from "../entities/Lesson";
import { CourseModule } from "../entities/CourseModule";
import { verifyActiveEnrollment } from "./EnrollmentService";


interface CreateLessonData {
  moduleId: number;
  lessonTitle: string;
  lessonType: LessonType;
  contentUrl?: string;
  textContent?: string;
  description?: string;
  duration: number;
  sequenceNumber: number;
}

export const createLesson = async (
  data: CreateLessonData,
  instructorId: number
) => {
  const moduleRepository = AppDataSource.getRepository(CourseModule);
  const lessonRepository = AppDataSource.getRepository(Lesson);

  const courseModule = await moduleRepository.findOne({
    where: { id: data.moduleId },
    relations: { course: true },
  });

  if (!courseModule) {
    throw new Error("Module not found");
  }

  if (courseModule.course.instructorId !== instructorId) {
    throw new Error("You cannot manage this course");
  }

  const lesson = lessonRepository.create({
    ...data,
    courseId: courseModule.courseId,
    contentUrl: data.contentUrl ?? null,
    textContent: data.textContent ?? null,
    description: data.description ?? null,
  });

  return await lessonRepository.save(lesson);
};

export const getLessonsByModule = async (
  moduleId: number,
  instructorId: number
) => {
  const moduleRepository = AppDataSource.getRepository(CourseModule);
  const lessonRepository = AppDataSource.getRepository(Lesson);

  const courseModule = await moduleRepository.findOne({
    where: { id: moduleId },
    relations: { course: true },
  });

  if (!courseModule) {
    throw new Error("Module not found");
  }

  if (courseModule.course.instructorId !== instructorId) {
    throw new Error("You cannot manage this course");
  }

  return await lessonRepository.find({
    where: { moduleId },
    order: { sequenceNumber: "ASC" },
  });
};

interface UpdateLessonData {
  lessonTitle?: string;
  lessonType?: LessonType;
  contentUrl?: string | null;
  textContent?: string | null;
  description?: string | null;
  duration?: number;
  sequenceNumber?: number;
}

export const updateLesson = async (
  id: number,
  instructorId: number,
  data: UpdateLessonData
) => {
  const lessonRepository = AppDataSource.getRepository(Lesson);

  const lesson = await lessonRepository.findOne({
    where: { id },
    relations: { course: true },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  if (lesson.course.instructorId !== instructorId) {
    throw new Error("You cannot manage this course");
  }

  Object.assign(lesson, data);

  return await lessonRepository.save(lesson);
};

export const deleteLesson = async (
  id: number,
  instructorId: number
) => {
  const lessonRepository = AppDataSource.getRepository(Lesson);

  const lesson = await lessonRepository.findOne({
    where: { id },
    relations: { course: true },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  if (lesson.course.instructorId !== instructorId) {
    throw new Error("You cannot manage this course");
  }

  await lessonRepository.remove(lesson);

  return true;
};

export const getStudentLessonsByModule = async (
  moduleId: number,
  studentId: number
) => {
  const moduleRepository = AppDataSource.getRepository(CourseModule);
  const lessonRepository = AppDataSource.getRepository(Lesson);

  const courseModule = await moduleRepository.findOne({
    where: { id: moduleId },
    relations: { course: true },
  });

  if (!courseModule) {
    throw new Error("Module not found");
  }

  const enrollment = await verifyActiveEnrollment(
    studentId,
    courseModule.courseId
  );

  if (!enrollment) {
    throw new Error("Active enrollment required");
  }

  return await lessonRepository.find({
    where: { moduleId },
    order: { sequenceNumber: "ASC" },
  });
};

export const getStudentLessonFile = async (
  filename: string,
  studentId: number
) => {
  const lessonRepository = AppDataSource.getRepository(Lesson);

  const lesson = await lessonRepository.findOne({
    where: {
      contentUrl: `/uploads/${filename}`,
    },
  });

  if (!lesson) {
    throw new Error("Lesson file not found");
  }

  const enrollment = await verifyActiveEnrollment(
    studentId,
    lesson.courseId
  );

  if (!enrollment) {
    throw new Error("Active enrollment required");
  }

  return lesson;
};