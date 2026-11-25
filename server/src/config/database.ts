
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../entities/User";
import { Course } from "../entities/Course";
import { CourseModule } from "../entities/CourseModule";
import { Lesson } from "../entities/Lesson";
import { Enrollment } from "../entities/Enrollment";
import { LessonProgress } from "../entities/LessonProgress";
import { Quiz } from "../entities/Quiz";
import { Question } from "../entities/Question";
import { QuizAttempt } from "../entities/QuizAttempt";
import { QuizAnswer } from "../entities/QuizAnswer";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

entities: [
  User,
  Course,
  CourseModule,
  Lesson,
  Enrollment,
  LessonProgress,
  Quiz,
  Question,
  QuizAttempt,
  QuizAnswer,
],


  synchronize: false,
  logging: true,
});
