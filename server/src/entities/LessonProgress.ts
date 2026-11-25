import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from "typeorm";

import { User } from "./User";
import { Course } from "./Course";
import { Lesson } from "./Lesson";

@Entity("lesson_progress")
@Unique(["studentId", "lessonId"])
export class LessonProgress {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "student_id", type: "int" })
  studentId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "student_id" })
  student!: User;

  @Column({ name: "course_id", type: "int" })
  courseId!: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course!: Course;

  @Column({ name: "lesson_id", type: "int" })
  lessonId!: number;

  @ManyToOne(() => Lesson)
  @JoinColumn({ name: "lesson_id" })
  lesson!: Lesson;

  @Column({ name: "is_completed", type: "boolean", default: false })
  isCompleted!: boolean;

  @Column({
    name: "completed_at",
    type: "datetime",
    nullable: true,
  })
  completedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;
}