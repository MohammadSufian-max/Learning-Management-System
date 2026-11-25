
import api from "../../../api/axios";

export interface QuizQuestion {
  id: number;
  quizId: number;
  question: string;
  questionType: "mcq" | "true_false";
  optionA: string;
  optionB: string;
  optionC?: string | null;
  optionD?: string | null;
  marks: number;
  sequenceNumber: number;
}

export interface QuizAttempt {
  id: number;
  studentId: number;
  quizId: number;
  startedAt: string;
  submittedAt: string | null;
  totalMarks: number;
  obtainedMarks: number;
  result: "pass" | "fail" | null;
  attemptStatus: "in_progress" | "submitted" | "evaluated";
}

export interface StartAttemptResponse {
  attempt: QuizAttempt;
  duration: number;
  expiresAt: string;
}

export interface QuizResult {
  attemptId: number;
  totalMarks: number;
  obtainedMarks: number;
  passingMarks: number;
  result: "pass" | "fail";
  attemptStatus: string;
  submittedAt: string;
}

export interface InstructorQuizResult {
  attemptId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  quizId: number;
  quizTitle: string;
  obtainedMarks: number;
  totalMarks: number;
  result: "pass" | "fail" | null;
  submittedAt: string | null;
}

export const getStudentQuizQuestions = async (quizId: number) => {
  const response = await api.get(
    `/questions/student/quiz/${quizId}`
  );

  return response.data.data as QuizQuestion[];
};

export const startQuizAttempt = async (quizId: number) => {
  const response = await api.post(
    `/quiz-attempts/${quizId}/start`
  );

  return response.data.data as StartAttemptResponse;
};

export const saveQuizAnswer = async (
  attemptId: number,
  questionId: number,
  selectedAnswer: string
) => {
  const response = await api.put(
    `/quiz-attempts/${attemptId}/answer`,
    {
      questionId,
      selectedAnswer,
    }
  );

  return response.data.data;
};

export const submitQuizAttempt = async (attemptId: number) => {
  const response = await api.post(
    `/quiz-attempts/${attemptId}/submit`
  );

  return response.data.data as QuizResult;
};

export const getMyQuizAttempts = async (quizId: number) => {
  const response = await api.get(
    `/quiz-attempts/${quizId}/history`
  );

  return response.data.data as QuizAttempt[];
};


export interface StudentQuiz {
  id: number;
  courseId: number;
  courseTitle: string;
  quizTitle: string;
  description: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  status: "published";
}

export const getStudentQuizzes = async (): Promise<StudentQuiz[]> => {
  const response = await api.get("/quizzes/student/my");
  return response.data.data;
};

export interface StudentQuizAttempt extends QuizAttempt {
  quizTitle: string;
}

export const getAllMyQuizAttempts = async (): Promise<StudentQuizAttempt[]> => {
  const response = await api.get("/quiz-attempts/my-results");
  return response.data.data;
};

export const getInstructorQuizResults = async (): Promise<InstructorQuizResult[]> => {
  const response = await api.get("/quiz-attempts/instructor/results");
  return response.data.data;
};