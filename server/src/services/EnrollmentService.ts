
import { AppDataSource } from "../config/database";
import { Enrollment, EnrollmentStatus } from "../entities/Enrollment";
import { Course, CourseStatus } from "../entities/Course";

export const cancelEnrollment = async (enrollmentId: number) => {
  const enrollmentRepository = AppDataSource.getRepository(Enrollment);

  const enrollment = await enrollmentRepository.findOne({
    where: { id: enrollmentId },
    relations: {
      student: true,
      course: true,
    },
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  if (enrollment.status !== EnrollmentStatus.ACTIVE) {
    throw new Error("Only active enrollments can be cancelled");
  }

  enrollment.status = EnrollmentStatus.CANCELLED;

  return await enrollmentRepository.save(enrollment);
};

export const enrollStudent = async (
  studentId: number,
  courseId: number
) => {
  const enrollmentRepository = AppDataSource.getRepository(Enrollment);
  const courseRepository = AppDataSource.getRepository(Course);

  const course = await courseRepository.findOne({
    where: {
      id: courseId,
      status: CourseStatus.PUBLISHED,
    },
  });

  if (!course) {
    throw new Error("Published course not found");
  }

  const existingEnrollment = await enrollmentRepository.findOne({
    where: {
      studentId,
      courseId,
      status: EnrollmentStatus.ACTIVE,
    },
  });

  if (existingEnrollment) {
    throw new Error("Already enrolled in this course");
  }

  const enrollment = enrollmentRepository.create({
    studentId,
    courseId,
    status: EnrollmentStatus.ACTIVE,
  });

  return await enrollmentRepository.save(enrollment);
};

export const getMyEnrollments = async (studentId: number) => {
  const enrollmentRepository = AppDataSource.getRepository(Enrollment);

  return await enrollmentRepository.find({
    where: { studentId },
    relations: {
      course: true,
    },
    order: {
      enrollmentDate: "DESC",
    },
  });
};

// Admin: Fetch all platform enrollments
export const getAllEnrollments = async () => {
  const enrollmentRepository = AppDataSource.getRepository(Enrollment);

  return await enrollmentRepository.find({
    relations: {
      student: true,
      course: true,
    },
    order: {
      enrollmentDate: "DESC",
    },
  });
};

export const verifyActiveEnrollment = async (
  studentId: number,
  courseId: number
) => {
  const enrollmentRepository = AppDataSource.getRepository(Enrollment);

  const enrollment = await enrollmentRepository.findOne({
    where: {
      studentId,
      courseId,
      status: EnrollmentStatus.ACTIVE,
    },
  });

  return enrollment;
};
