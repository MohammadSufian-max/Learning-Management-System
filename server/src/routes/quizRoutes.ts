
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

import { UserRole } from "../entities/User";

const router = Router();

router.get(
  "/student/my",
  authMiddleware,
  authorizeRoles(UserRole.STUDENT),
  fetchStudentQuizzes
);

router.use(authMiddleware, authorizeRoles(UserRole.INSTRUCTOR));

router.post("/", addQuiz);
router.get("/course/:courseId", fetchQuizzes);
router.put("/:id", editQuiz);
router.patch("/:id/status", changeQuizStatus);
router.delete("/:id", removeQuiz);

export default router;
