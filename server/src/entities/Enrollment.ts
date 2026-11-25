
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Course } from "./Course";

export enum EnrollmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
}

@Entity("enrollments")
export class Enrollment {
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

  @CreateDateColumn({ name: "enrollment_date", type: "datetime" })
  enrollmentDate!: Date;

  @Column({
    type: "enum",
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status!: EnrollmentStatus;
}
