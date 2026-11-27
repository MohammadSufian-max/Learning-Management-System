
import { Router } from "express";
import {
  addQuestion,
  fetchQuestions,
  fetchStudentQuestions,
  editQuestion,
  removeQuestion,
  changeQuestionOrder,
} from "../controllers/QuestionController";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/authMiddleware";
import { authorizePermissions } from "../middlewares/authorizePermissions";
import { UserRole } from "../entities/User";

const router = Router();

// Student: fetch published quiz questions without correct answers.
router.get(
  "/student/quiz/:quizId",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchStudentQuestions
);

// Create question
router.post(
  "/quiz/:quizId",
  authMiddleware,
  authorizePermissions("questions.create"),
  addQuestion
);

// Fetch questions
router.get(
  "/quiz/:quizId",
  authMiddleware,
  authorizePermissions("questions.view"),
  fetchQuestions
);

// Reorder questions
router.patch(
  "/quiz/:quizId/reorder",
  authMiddleware,
  authorizePermissions("questions.edit"),
  changeQuestionOrder
);

// Edit question
router.put(
  "/:id",
  authMiddleware,
  authorizePermissions("questions.edit"),
  editQuestion
);

// Delete question
router.delete(
  "/:id",
  authMiddleware,
  authorizePermissions("questions.delete"),
  removeQuestion
);

export default router;
