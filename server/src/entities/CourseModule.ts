
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

@Entity("course_modules")
export class CourseModule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "course_id", type: "int" })
  courseId!: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course!: Course;

  @Column({ name: "module_title", type: "varchar", length: 200 })
  moduleTitle!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "sequence_number", type: "int" })
  sequenceNumber!: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}
