
import { AppDataSource } from "../config/database";
import { Quiz, QuizStatus } from "../entities/Quiz";
import { Question } from "../entities/Question";
import { In } from "typeorm";
import {
  QuizAttempt,
  AttemptStatus,
  QuizResult,
} from "../entities/QuizAttempt";
import { QuizAnswer } from "../entities/QuizAnswer";
import { verifyActiveEnrollment } from "./EnrollmentService";
import { User } from "../entities/User";
import { Course } from "../entities/Course";

// Calculate quiz expiry time
const getExpiryTime = (startedAt: Date, duration: number) => {
  return new Date(startedAt.getTime() + duration * 60 * 1000);
};

// Evaluate and finalize an attempt inside a transaction
const evaluateAttempt = async (
  manager: any,
  attempt: QuizAttempt,
  quiz: Quiz
) => {
  const questionRepository = manager.getRepository(Question);
  const answerRepository = manager.getRepository(QuizAnswer);
  const attemptRepository = manager.getRepository(QuizAttempt);

  const questions = await questionRepository.find({
    where: { quizId: attempt.quizId },
  });

  const answers = await answerRepository.find({
    where: { attemptId: attempt.id },
  });

  let obtainedMarks = 0;

  for (const question of questions) {
    const answer = answers.find(
      (item: QuizAnswer) => item.questionId === question.id
    );

    if (answer && answer.selectedAnswer === question.correctAnswer) {
      obtainedMarks += question.marks;
    }
  }

  attempt.submittedAt = new Date();
  attempt.obtainedMarks = obtainedMarks;
  attempt.result =
    obtainedMarks >= quiz.passingMarks
      ? QuizResult.PASS
      : QuizResult.FAIL;
  attempt.attemptStatus = AttemptStatus.EVALUATED;

  await attemptRepository.save(attempt);

  return {
    attemptId: attempt.id,
    totalMarks: attempt.totalMarks,
    obtainedMarks: attempt.obtainedMarks,
    passingMarks: quiz.passingMarks,
    result: attempt.result,
    attemptStatus: attempt.attemptStatus,
    submittedAt: attempt.submittedAt,
  };
};

// Start a new quiz attempt
export const startQuizAttempt = async (
  studentId: number,
  quizId: number
) => {
  const quizRepository = AppDataSource.getRepository(Quiz);
  const attemptRepository = AppDataSource.getRepository(QuizAttempt);
  const questionRepository = AppDataSource.getRepository(Question);

  const quiz = await quizRepository.findOne({
    where: {
      id: quizId,
      status: QuizStatus.PUBLISHED,
    },
  });

  if (!quiz) {
    throw new Error("Published quiz not found");
  }

  if (quiz.duration <= 0) {
    throw new Error("Quiz duration must be greater than zero");
  }

  const enrollment = await verifyActiveEnrollment(
    studentId,
    quiz.courseId
  );

  if (!enrollment) {
    throw new Error("Active course enrollment required");
  }

  const questions = await questionRepository.find({
    where: { quizId },
  });

  if (questions.length === 0) {
    throw new Error("Quiz has no questions");
  }

  const attempt = attemptRepository.create({
    studentId,
    quizId,
    totalMarks: quiz.totalMarks,
    obtainedMarks: 0,
    result: null,
    attemptStatus: AttemptStatus.IN_PROGRESS,
  });

  const savedAttempt = await attemptRepository.save(attempt);

  return {
    attempt: savedAttempt,
    duration: quiz.duration,
    expiresAt: getExpiryTime(
      savedAttempt.startedAt,
      quiz.duration
    ),
  };
};

// Save or update a student's answer
export const saveQuizAnswer = async (
  studentId: number,
  attemptId: number,
  questionId: number,
  selectedAnswer: string
) => {
  const outcome = await AppDataSource.transaction(async (manager) => {
    const attemptRepository = manager.getRepository(QuizAttempt);
    const questionRepository = manager.getRepository(Question);
    const answerRepository = manager.getRepository(QuizAnswer);
    const quizRepository = manager.getRepository(Quiz);

    const attempt = await attemptRepository.findOne({
      where: {
        id: attemptId,
        studentId,
      },
      lock: { mode: "pessimistic_write" },
    });

    if (!attempt) {
      throw new Error("Quiz attempt not found");
    }

    if (attempt.attemptStatus !== AttemptStatus.IN_PROGRESS) {
      throw new Error("Quiz attempt is not in progress");
    }

    const quiz = await quizRepository.findOne({
      where: { id: attempt.quizId },
    });

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const expiresAt = getExpiryTime(
      attempt.startedAt,
      quiz.duration
    );

    if (Date.now() >= expiresAt.getTime()) {
      const result = await evaluateAttempt(manager, attempt, quiz);

      return {
        expired: true,
        result,
      };
    }

    const question = await questionRepository.findOne({
      where: {
        id: questionId,
        quizId: attempt.quizId,
      },
    });

    if (!question) {
      throw new Error("Question not found in this quiz");
    }

    const validAnswers =
      question.questionType === "mcq"
        ? ["A", "B", "C", "D"]
        : ["A", "B"];

    if (!validAnswers.includes(selectedAnswer)) {
      throw new Error("Invalid selected answer");
    }

    let answer = await answerRepository.findOne({
      where: {
        attemptId,
        questionId,
      },
    });

    if (answer) {
      answer.selectedAnswer = selectedAnswer;
    } else {
      answer = answerRepository.create({
        attemptId,
        questionId,
        selectedAnswer,
      });
    }

    const savedAnswer = await answerRepository.save(answer);

    return {
      expired: false,
      answer: savedAnswer,
    };
  });

  if (outcome.expired) {
    throw new Error(
      "Quiz time expired. Attempt was automatically submitted and evaluated."
    );
  }

  return outcome.answer;
};

// Submit and evaluate quiz on backend
export const submitQuizAttempt = async (
  studentId: number,
  attemptId: number
) => {
  return await AppDataSource.transaction(async (manager) => {
    const attemptRepository = manager.getRepository(QuizAttempt);
    const quizRepository = manager.getRepository(Quiz);

    const attempt = await attemptRepository.findOne({
      where: {
        id: attemptId,
        studentId,
      },
      lock: { mode: "pessimistic_write" },
    });

    if (!attempt) {
      throw new Error("Quiz attempt not found");
    }

    if (attempt.attemptStatus !== AttemptStatus.IN_PROGRESS) {
      throw new Error("Quiz attempt already submitted");
    }

    const quiz = await quizRepository.findOne({
      where: { id: attempt.quizId },
    });

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    return await evaluateAttempt(manager, attempt, quiz);
  });
};

// Get student's previous attempts
export const getMyQuizAttempts = async (
  studentId: number,
  quizId: number
) => {
  return await AppDataSource.getRepository(QuizAttempt).find({
    where: {
      studentId,
      quizId,
    },
    order: {
      startedAt: "DESC",
    },
  });
};


// Get all quiz attempts of a student
export const getAllMyQuizAttempts = async (studentId: number) => {
  const attemptRepository = AppDataSource.getRepository(QuizAttempt);
  const quizRepository = AppDataSource.getRepository(Quiz);

  const attempts = await attemptRepository.find({
    where: { studentId },
    order: {
      startedAt: "DESC",
    },
  });

  if (attempts.length === 0) {
    return [];
  }

  const quizIds = [...new Set(attempts.map((attempt) => attempt.quizId))];

  const quizzes = await quizRepository.find({
    where: {
      id: In(quizIds),
    },
    select: {
      id: true,
      quizTitle: true,
    },
  });

  const quizTitleMap = new Map(
    quizzes.map((quiz) => [quiz.id, quiz.quizTitle])
  );

  return attempts.map((attempt) => ({
    ...attempt,
    quizTitle: quizTitleMap.get(attempt.quizId) ?? "Unknown Quiz",
  }));
};

// Get quiz results for all students enrolled in instructor's courses
export const getInstructorQuizResults = async (instructorId: number) => {
  const attemptRepository = AppDataSource.getRepository(QuizAttempt);

  const attempts = await attemptRepository
    .createQueryBuilder("attempt")
    .leftJoinAndSelect("attempt.student", "student")
    .leftJoinAndSelect("attempt.quiz", "quiz")
    .innerJoin(Course, "course", "course.id = quiz.courseId")
    .where("course.instructorId = :instructorId", { instructorId })
    .andWhere("attempt.attemptStatus = :status", {
      status: AttemptStatus.EVALUATED,
    })
    .orderBy("attempt.submittedAt", "DESC")
    .getMany();

  return attempts.map((attempt) => ({
    attemptId: attempt.id,
    studentId: attempt.studentId,
    studentName: attempt.student.fullName,
    studentEmail: attempt.student.email,
    quizId: attempt.quizId,
    quizTitle: attempt.quiz.quizTitle,
    obtainedMarks: attempt.obtainedMarks,
    totalMarks: attempt.totalMarks,
    result: attempt.result,
    submittedAt: attempt.submittedAt,
  }));
};