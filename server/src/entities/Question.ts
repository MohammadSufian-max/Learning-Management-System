
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Quiz } from "./Quiz";

export enum QuestionType {
  MCQ = "mcq",
  TRUE_FALSE = "true_false",
}

@Entity("questions")
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "quiz_id", type: "int" })
  quizId!: number;

  @ManyToOne(() => Quiz, { onDelete: "CASCADE" })
  @JoinColumn({ name: "quiz_id" })
  quiz!: Quiz;

  @Column({ type: "text" })
  question!: string;

  @Column({
    name: "question_type",
    type: "enum",
    enum: QuestionType,
  })
  questionType!: QuestionType;

  @Column({ name: "option_a", type: "text" })
  optionA!: string;

  @Column({ name: "option_b", type: "text" })
  optionB!: string;

  @Column({ name: "option_c", type: "text", nullable: true })
  optionC!: string | null;

  @Column({ name: "option_d", type: "text", nullable: true })
  optionD!: string | null;

  @Column({ name: "correct_answer", type: "varchar", length: 10 })
  correctAnswer!: string;

  @Column({ type: "int" })
  marks!: number;

  @Column({ name: "sequence_number", type: "int" })
  sequenceNumber!: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}
