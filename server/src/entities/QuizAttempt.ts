
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";

import { User } from "./User";
import { Quiz } from "./Quiz";

export enum QuizResult {
  PASS = "pass",
  FAIL = "fail",
}

export enum AttemptStatus {
  IN_PROGRESS = "in_progress",
  SUBMITTED = "submitted",
  EVALUATED = "evaluated",
}

@Entity("quiz_attempts")
export class QuizAttempt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "student_id", type: "int" })
  studentId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "student_id" })
  student!: User;

  @Column({ name: "quiz_id", type: "int" })
  quizId!: number;

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: "quiz_id" })
  quiz!: Quiz;

  @CreateDateColumn({ name: "started_at", type: "datetime" })
  startedAt!: Date;

  @Column({ name: "submitted_at", type: "datetime", nullable: true })
  submittedAt!: Date | null;

  @Column({ name: "total_marks", type: "int" })
  totalMarks!: number;

  @Column({ name: "obtained_marks", type: "int", default: 0 })
  obtainedMarks!: number;

  @Column({
    type: "enum",
    enum: QuizResult,
    nullable: true,
  })
  result!: QuizResult | null;

  @Column({
    name: "attempt_status",
    type: "enum",
    enum: AttemptStatus,
    default: AttemptStatus.IN_PROGRESS,
  })
  attemptStatus!: AttemptStatus;
}
