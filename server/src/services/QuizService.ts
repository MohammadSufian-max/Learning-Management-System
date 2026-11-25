
import { AppDataSource } from "../config/database";
import { Quiz, QuizStatus } from "../entities/Quiz";
import { Course } from "../entities/Course";
import { CourseModule } from "../entities/CourseModule";

interface CreateQuizData {
  courseId: number;
  moduleId?: number | null;
  quizTitle: string;
  description?: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
}

interface UpdateQuizData {
  quizTitle?: string;
  description?: string | null;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  moduleId?: number | null;
}

const verifyCourseOwnership = async (
  courseId: number,
  instructorId: number
) => {
  const courseRepository = AppDataSource.getRepository(Course);

  const course = await courseRepository.findOneBy({
    id: courseId,
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.instructorId !== instructorId) {
    throw new Error("You cannot manage this course");
  }

  return course;
};

export const createQuiz = async (
  data: CreateQuizData,
  instructorId: number
) => {
  await verifyCourseOwnership(data.courseId, instructorId);

  const moduleRepository = AppDataSource.getRepository(CourseModule);
  const quizRepository = AppDataSource.getRepository(Quiz);

  if (data.moduleId) {
    const courseModule = await moduleRepository.findOneBy({
      id: data.moduleId,
      courseId: data.courseId,
    });

    if (!courseModule) {
      throw new Error("Module not found in this course");
    }
  }

  const quiz = quizRepository.create({
    ...data,
    moduleId: data.moduleId ?? null,
    description: data.description ?? null,
    status: QuizStatus.DRAFT,
  });

  return await quizRepository.save(quiz);
};

export const getQuizzesByCourse = async (
  courseId: number,
  instructorId: number
) => {
  await verifyCourseOwnership(courseId, instructorId);

  const quizRepository = AppDataSource.getRepository(Quiz);

  return await quizRepository.find({
    where: { courseId },
    order: { createdAt: "DESC" },
  });
};

export const updateQuiz = async (
  id: number,
  instructorId: number,
  data: UpdateQuizData
) => {
  const quizRepository = AppDataSource.getRepository(Quiz);

  const quiz = await quizRepository.findOne({
    where: { id },
    relations: { course: true },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (quiz.course.instructorId !== instructorId) {
    throw new Error("You cannot manage this course");
  }

  if (data.moduleId !== undefined && data.moduleId !== null) {
    const moduleRepository = AppDataSource.getRepository(CourseModule);

    const courseModule = await moduleRepository.findOneBy({
      id: data.moduleId,
      courseId: quiz.courseId,
    });

    if (!courseModule) {
      throw new Error("Module not found in this course");
    }
  }

  Object.assign(quiz, data);

  return await quizRepository.save(quiz);
};

export const updateQuizStatus = async (
  id: number,
  instructorId: number,
  status: QuizStatus
) => {
  const quizRepository = AppDataSource.getRepository(Quiz);

  const quiz = await quizRepository.findOne({
    where: { id },
    relations: { course: true },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (quiz.course.instructorId !== instructorId) {
    throw new Error("You cannot manage this course");
  }

  quiz.status = status;

  return await quizRepository.save(quiz);
};

export const deleteQuiz = async (
  id: number,
  instructorId: number
) => {
  const quizRepository = AppDataSource.getRepository(Quiz);

  const quiz = await quizRepository.findOne({
    where: { id },
    relations: { course: true },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (quiz.course.instructorId !== instructorId) {
    throw new Error("You cannot manage this course");
  }

  await quizRepository.remove(quiz);

  return true;
};
