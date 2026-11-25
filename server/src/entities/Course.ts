
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum CourseStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

@Entity("courses")
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "course_title", type: "varchar", length: 200 })
  courseTitle!: string;

  @Column({ name: "course_code", type: "varchar", length: 50, unique: true })
  courseCode!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  thumbnail!: string | null;

  @Column({ type: "varchar", length: 100 })
  category!: string;

  @Column({ type: "enum", enum: CourseLevel })
  level!: CourseLevel;

  @Column({ name: "instructor_id", type: "int" })
  instructorId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "instructor_id" })
  instructor!: User;

  @Column({ type: "int" })
  duration!: number;

  @Column({
    type: "enum",
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status!: CourseStatus;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}
