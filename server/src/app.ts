
import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/authRoutes";
import { authMiddleware } from "./middlewares/authMiddleware";
import { authorizeRoles } from "./middlewares/authorizeRoles";
import { UserRole } from "./entities/User";
import userRoutes from "./routes/userRoutes";
import courseRoutes from "./routes/courseRoutes";
import courseModuleRoutes from "./routes/courseModuleRoutes";
import lessonRoutes from "./routes/lessonRoutes";
import lessonProgressRoutes from "./routes/lessonProgressRoutes";
import enrollmentRoutes from "./routes/enrollmentRoutes";
import quizRoutes from "./routes/quizRoutes";
import questionRoutes from "./routes/questionRoutes";
import quizAttemptRoutes from "./routes/quizAttemptRoutes";


const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((url) => url.trim())
      : "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "src", "uploads"))
);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Learning Management System API is running",
  });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

app.get(
  "/api/admin/test",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN),
  (_req, res) => {
    res.json({ success: true, message: "Admin access granted" });
  }
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/course-modules", courseModuleRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", lessonProgressRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof Error && err.message === "Only video and PDF files are allowed") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size cannot exceed 100 MB",
    });
  }

  next(err);
});

export default app;
