
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

export enum LessonType {
  VIDEO = "video",
  PDF = "pdf",
  TEXT = "text",
}

@Entity("lessons")
export class Lesson {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "course_id", type: "int" })
  courseId!: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course!: Course;

  @Column({ name: "module_id", type: "int" })
  moduleId!: number;

  @ManyToOne(() => CourseModule)
  @JoinColumn({ name: "module_id" })
  module!: CourseModule;

  @Column({ name: "lesson_title", type: "varchar", length: 200 })
  lessonTitle!: string;

  @Column({
  name: "lesson_type",
  type: "enum",
  enum: LessonType,
})
lessonType!: LessonType;

  @Column({ name: "content_url", type: "varchar", length: 500, nullable: true })
  contentUrl!: string | null;

  @Column({ name: "text_content", type: "longtext", nullable: true })
  textContent!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int" })
  duration!: number;

  @Column({ name: "sequence_number", type: "int" })
  sequenceNumber!: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}
