
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

import { QuizAttempt } from "./QuizAttempt";
import { Question } from "./Question";

@Entity("quiz_answers")
@Unique(["attemptId", "questionId"])
export class QuizAnswer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "attempt_id", type: "int" })
  attemptId!: number;

  @ManyToOne(() => QuizAttempt, { onDelete: "CASCADE" })
  @JoinColumn({ name: "attempt_id" })
  attempt!: QuizAttempt;

  @Column({ name: "question_id", type: "int" })
  questionId!: number;

  @ManyToOne(() => Question)
  @JoinColumn({ name: "question_id" })
  question!: Question;

  @Column({ name: "selected_answer", type: "varchar", length: 10 })
  selectedAnswer!: string;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}
