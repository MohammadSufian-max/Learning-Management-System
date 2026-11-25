
import { AppDataSource } from "../config/database";
import { Question, QuestionType } from "../entities/Question";
import { Quiz } from "../entities/Quiz";
import { verifyActiveEnrollment } from "./EnrollmentService";

interface QuestionData {
  question: string;
  questionType: QuestionType;
  optionA: string;
  optionB: string;
  optionC?: string | null;
  optionD?: string | null;
  correctAnswer: string;
  marks: number;
  sequenceNumber: number;
}

const verifyQuizOwnership = async (
  quizId: number,
  instructorId: number
) => {
  const quizRepository = AppDataSource.getRepository(Quiz);

  const quiz = await quizRepository.findOne({
    where: { id: quizId },
    relations: { course: true },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (quiz.course.instructorId !== instructorId) {
    throw new Error("You cannot manage this quiz");
  }

  return quiz;
};

const validateQuestionData = (data: QuestionData) => {
  if (
    !data.question?.trim() ||
    !Object.values(QuestionType).includes(data.questionType) ||
    !data.optionA?.trim() ||
    !data.optionB?.trim() ||
    !Number.isInteger(data.marks) ||
    data.marks <= 0 ||
    !Number.isInteger(data.sequenceNumber) ||
    data.sequenceNumber <= 0
  ) {
    throw new Error("Invalid question details");
  }

  if (data.questionType === QuestionType.MCQ) {
    if (
      !data.optionC?.trim() ||
      !data.optionD?.trim() ||
      !["A", "B", "C", "D"].includes(data.correctAnswer)
    ) {
      throw new Error("MCQ requires four options and a valid correct answer");
    }
  }

  if (data.questionType === QuestionType.TRUE_FALSE) {
    if (!["A", "B"].includes(data.correctAnswer)) {
      throw new Error("True/False correct answer must be A or B");
    }
  }
};

export const createQuestion = async (
  quizId: number,
  instructorId: number,
  data: QuestionData
) => {
  await verifyQuizOwnership(quizId, instructorId);
  validateQuestionData(data);

  const repository = AppDataSource.getRepository(Question);

  const question = repository.create({
    ...data,
    quizId,
    optionC:
      data.questionType === QuestionType.TRUE_FALSE
        ? null
        : data.optionC,
    optionD:
      data.questionType === QuestionType.TRUE_FALSE
        ? null
        : data.optionD,
  });

  return await repository.save(question);
};

export const getQuestionsByQuiz = async (
  quizId: number,
  instructorId: number
) => {
  await verifyQuizOwnership(quizId, instructorId);

  const repository = AppDataSource.getRepository(Question);

  return await repository.find({
    where: { quizId },
    order: { sequenceNumber: "ASC" },
  });
};

// Student-facing questions: never return correctAnswer.
export const getStudentQuestionsByQuiz = async (
  quizId: number,
  studentId: number
) => {
  const quizRepository = AppDataSource.getRepository(Quiz);

  const quiz = await quizRepository.findOne({
    where: { id: quizId },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (quiz.status !== "published") {
    throw new Error("This quiz is not published");
  }

  const enrollment = await verifyActiveEnrollment(
    studentId,
    quiz.courseId
  );

  if (!enrollment) {
    throw new Error("Active course enrollment required");
  }

  const repository = AppDataSource.getRepository(Question);

  const questions = await repository.find({
    where: { quizId },
    order: { sequenceNumber: "ASC" },
  });

  return questions.map((question) => ({
    id: question.id,
    quizId: question.quizId,
    question: question.question,
    questionType: question.questionType,
    optionA: question.optionA,
    optionB: question.optionB,
    optionC: question.optionC,
    optionD: question.optionD,
    marks: question.marks,
    sequenceNumber: question.sequenceNumber,
  }));
};

export const updateQuestion = async (
  questionId: number,
  instructorId: number,
  data: Partial<QuestionData>
) => {
  const repository = AppDataSource.getRepository(Question);

  const question = await repository.findOne({
    where: { id: questionId },
    relations: { quiz: { course: true } },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.quiz.course.instructorId !== instructorId) {
    throw new Error("You cannot manage this quiz");
  }

  const updatedData = {
    question: data.question ?? question.question,
    questionType: data.questionType ?? question.questionType,
    optionA: data.optionA ?? question.optionA,
    optionB: data.optionB ?? question.optionB,
    optionC: data.optionC !== undefined ? data.optionC : question.optionC,
    optionD: data.optionD !== undefined ? data.optionD : question.optionD,
    correctAnswer: data.correctAnswer ?? question.correctAnswer,
    marks: data.marks ?? question.marks,
    sequenceNumber: data.sequenceNumber ?? question.sequenceNumber,
  };

  validateQuestionData(updatedData);

  Object.assign(question, updatedData);

  if (question.questionType === QuestionType.TRUE_FALSE) {
    question.optionC = null;
    question.optionD = null;
  }

  return await repository.save(question);
};

export const deleteQuestion = async (
  questionId: number,
  instructorId: number
) => {
  const repository = AppDataSource.getRepository(Question);

  const question = await repository.findOne({
    where: { id: questionId },
    relations: { quiz: { course: true } },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.quiz.course.instructorId !== instructorId) {
    throw new Error("You cannot manage this quiz");
  }

  await repository.remove(question);

  return true;
};

export const reorderQuestions = async (
  quizId: number,
  instructorId: number,
  questionIds: number[]
) => {
  await verifyQuizOwnership(quizId, instructorId);

  if (
    !Array.isArray(questionIds) ||
    questionIds.length === 0 ||
    questionIds.some((id) => !Number.isInteger(id) || id <= 0) ||
    new Set(questionIds).size !== questionIds.length
  ) {
    throw new Error("Invalid question order");
  }

  const repository = AppDataSource.getRepository(Question);

  const questions = await repository.find({
    where: { quizId },
  });

  if (
    questions.length !== questionIds.length ||
    !questionIds.every((id) =>
      questions.some((question) => question.id === id)
    )
  ) {
    throw new Error("Question IDs do not match this quiz");
  }

  await AppDataSource.transaction(async (manager) => {
    const questionRepository = manager.getRepository(Question);

    for (let index = 0; index < questionIds.length; index++) {
      await questionRepository.update(
        { id: questionIds[index], quizId },
        { sequenceNumber: index + 1 }
      );
    }
  });

  return await repository.find({
    where: { quizId },
    order: { sequenceNumber: "ASC" },
  });
};
