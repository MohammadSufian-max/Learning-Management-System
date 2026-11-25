
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
import { UserRole } from "../entities/User";

const router = Router();

// Student: fetch published quiz questions without correct answers.
router.get(
  "/student/quiz/:quizId",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchStudentQuestions
);

// Instructor-only question management.
router.use(
  authMiddleware,
  authorizeRoles(UserRole.INSTRUCTOR)
);

router.post("/quiz/:quizId", addQuestion);
router.get("/quiz/:quizId", fetchQuestions);
router.patch("/quiz/:quizId/reorder", changeQuestionOrder);
router.put("/:id", editQuestion);
router.delete("/:id", removeQuestion);

export default router;
