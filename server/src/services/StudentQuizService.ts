
import { In } from "typeorm";
import { AppDataSource } from "../config/database";
import { Quiz, QuizStatus } from "../entities/Quiz";
import {
  Enrollment,
  EnrollmentStatus,
} from "../entities/Enrollment";

export const getStudentQuizzes = async (studentId: number) => {
  const enrollmentRepository =
    AppDataSource.getRepository(Enrollment);

  const quizRepository = AppDataSource.getRepository(Quiz);

  const enrollments = await enrollmentRepository.find({
    where: {
      studentId,
      status: EnrollmentStatus.ACTIVE,
    },
    select: {
      courseId: true,
    },
  });

  const courseIds = [
    ...new Set(enrollments.map((enrollment) => enrollment.courseId)),
  ];

  if (courseIds.length === 0) {
    return [];
  }

  const quizzes = await quizRepository.find({
    where: {
      courseId: In(courseIds),
      status: QuizStatus.PUBLISHED,
    },
    relations: {
      course: true,
    },
    order: {
      createdAt: "DESC",
    },
  });

  return quizzes.map((quiz) => ({
    id: quiz.id,
    courseId: quiz.courseId,
    courseTitle: quiz.course?.courseTitle,
    quizTitle: quiz.quizTitle,
    description: quiz.description,
    duration: quiz.duration,
    totalMarks: quiz.totalMarks,
    passingMarks: quiz.passingMarks,
    status: quiz.status,
  }));
};
