
import { Router } from "express";
import {
  addQuiz,
  fetchQuizzes,
  editQuiz,
  changeQuizStatus,
  removeQuiz,
} from "../controllers/QuizController";
import { fetchStudentQuizzes } from "../controllers/StudentQuizController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { authorizePermissions } from "../middlewares/authorizePermissions";
import { UserRole } from "../entities/User";

const router = Router();

// Student quizzes - preserve existing access
router.get(
  "/student/my",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchStudentQuizzes
);

// Create quiz
router.post(
  "/",
  authMiddleware,
  authorizePermissions("quizzes.create"),
  addQuiz
);

// Fetch quizzes
router.get(
  "/course/:courseId",
  authMiddleware,
  authorizePermissions("quizzes.view"),
  fetchQuizzes
);

// Edit quiz
router.put(
  "/:id",
  authMiddleware,
  authorizePermissions("quizzes.edit"),
  editQuiz
);

// Change quiz status
router.patch(
  "/:id/status",
  authMiddleware,
  authorizePermissions("quizzes.edit"),
  changeQuizStatus
);

// Delete quiz
router.delete(
  "/:id",
  authMiddleware,
  authorizePermissions("quizzes.delete"),
  removeQuiz
);

export default router;
