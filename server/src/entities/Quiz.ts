import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Course } from "./Course";
import { CourseModule } from "./CourseModule";

export enum QuizStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

@Entity("quizzes")
export class Quiz {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "course_id", type: "int" })
  courseId!: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course!: Course;

  @Column({ name: "module_id", type: "int", nullable: true })
  moduleId!: number | null;

  @ManyToOne(() => CourseModule, { nullable: true })
  @JoinColumn({ name: "module_id" })
  module!: CourseModule | null;

  @Column({ name: "quiz_title", type: "varchar", length: 200 })
  quizTitle!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int" })
  duration!: number;

  @Column({ name: "total_marks", type: "int" })
  totalMarks!: number;

  @Column({ name: "passing_marks", type: "int" })
  passingMarks!: number;

  @Column({
    type: "enum",
    enum: QuizStatus,
    default: QuizStatus.DRAFT,
  })
  status!: QuizStatus;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}