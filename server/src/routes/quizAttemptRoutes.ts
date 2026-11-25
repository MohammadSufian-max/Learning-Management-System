
import { Router } from "express";
import {
  startAttempt,
  saveAnswer,
  submitAttempt,
  fetchMyAttempts,
  fetchAllMyAttempts,
  fetchInstructorQuizResults,
} from "../controllers/QuizAttemptController";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/authMiddleware";
import { UserRole } from "../entities/User";

const router = Router();

// Student routes
router.post(
  "/:quizId/start",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  startAttempt
);

router.put(
  "/:attemptId/answer",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  saveAnswer
);

router.post(
  "/:attemptId/submit",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  submitAttempt
);

router.get(
  "/my-results",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchAllMyAttempts
);

router.get(
  "/:quizId/history",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchMyAttempts
);

// Instructor routes
router.get(
  "/instructor/results",
  authMiddleware,
  authorizeRoles(UserRole.INSTRUCTOR),
  fetchInstructorQuizResults
);

// Start a quiz attempt
router.post("/:quizId/start", startAttempt);

// Save or update an answer
router.put("/:attemptId/answer", saveAnswer);

// Submit and evaluate quiz
router.post("/:attemptId/submit", submitAttempt);

// Get all quiz attempts of logged-in student
router.get("/my-results", fetchAllMyAttempts);

// Get previous attempts of a specific quiz
router.get("/:quizId/history", fetchMyAttempts);

// Get previous attempts
router.get("/:quizId/history", fetchMyAttempts);

export default router;
