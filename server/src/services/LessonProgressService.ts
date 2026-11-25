import { AppDataSource } from "../config/database";
import { LessonProgress } from "../entities/LessonProgress";
import { Lesson } from "../entities/Lesson";
import { verifyActiveEnrollment } from "./EnrollmentService";

export const markLessonCompleted = async (
  studentId: number,
  lessonId: number
) => {
  const lessonRepository = AppDataSource.getRepository(Lesson);
  const progressRepository = AppDataSource.getRepository(LessonProgress);

  const lesson = await lessonRepository.findOneBy({ id: lessonId });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const enrollment = await verifyActiveEnrollment(
    studentId,
    lesson.courseId
  );

  if (!enrollment) {
    throw new Error("Active enrollment required");
  }

  let progress = await progressRepository.findOne({
    where: { studentId, lessonId },
  });

  if (progress?.isCompleted) {
    return progress;
  }

  if (!progress) {
    progress = progressRepository.create({
      studentId,
      courseId: lesson.courseId,
      lessonId,
    });
  }

  progress.isCompleted = true;
  progress.completedAt = new Date();

  return await progressRepository.save(progress);
};


export const getCourseProgress = async (
  studentId: number,
  courseId: number
) => {
  const enrollment = await verifyActiveEnrollment(studentId, courseId);

  if (!enrollment) {
    throw new Error("Active enrollment required");
  }

  const lessonRepository = AppDataSource.getRepository(Lesson);
  const progressRepository = AppDataSource.getRepository(LessonProgress);

  const lessons = await lessonRepository.find({
    where: { courseId },
    order: {
      sequenceNumber: "ASC",
    },
  });

  const progressRecords = await progressRepository.find({
    where: {
      studentId,
      courseId,
      isCompleted: true,
    },
  });

  const progressMap = new Map(
    progressRecords.map((record) => [record.lessonId, record])
  );

  const lessonDetails = lessons.map((lesson) => {
    const progress = progressMap.get(lesson.id);

    return {
      lessonId: lesson.id,
      lessonTitle: lesson.lessonTitle,
      sequenceNumber: lesson.sequenceNumber,
      isCompleted: Boolean(progress),
      completedAt: progress?.completedAt ?? null,
    };
  });

  const totalLessons = lessons.length;
  const completedLessons = lessonDetails.filter(
    (lesson) => lesson.isCompleted
  ).length;

  const progressPercentage =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  return {
    courseId,
    totalLessons,
    completedLessons,
    pendingLessons: totalLessons - completedLessons,
    progressPercentage,
    lessons: lessonDetails,
  };
};
