
import { AppDataSource } from "../config/database";
import {
  Course,
  CourseStatus,
  CourseLevel,
} from "../entities/Course";
import { User, UserRole, UserStatus } from "../entities/User";

interface CreateCourseData {
  courseTitle: string;
  courseCode: string;
  description: string;
  thumbnail?: string;
  category: string;
  level: CourseLevel;
  duration: number;
}

export const createCourse = async (
  data: CreateCourseData,
  instructorId: number
) => {
  const courseRepository = AppDataSource.getRepository(Course);
  const userRepository = AppDataSource.getRepository(User);

  const instructor = await userRepository.findOneBy({
    id: instructorId,
    role: UserRole.INSTRUCTOR,
    status: UserStatus.ACTIVE,
  });

  if (!instructor) {
    throw new Error("Active instructor not found");
  }

  const existingCourse = await courseRepository.findOneBy({
    courseCode: data.courseCode,
  });

  if (existingCourse) {
    throw new Error("Course code already exists");
  }

  const course = courseRepository.create({
    courseTitle: data.courseTitle,
    courseCode: data.courseCode,
    description: data.description,
    thumbnail: data.thumbnail ?? null,
    category: data.category,
    level: data.level,
    instructorId: instructor.id,
    duration: data.duration,
    status: CourseStatus.DRAFT,
  });

  return await courseRepository.save(course);
};


export const getCourses = async (
  role: UserRole,
  instructorId: number
) => {
  const courseRepository = AppDataSource.getRepository(Course);

  if (role === UserRole.ADMIN) {
    return await courseRepository.find({
      relations: {
  instructor: true,
},
      order: { createdAt: "DESC" },
    });
  }

  return await courseRepository.find({
    where: { instructorId },
    relations: {
  instructor: true,
},
    order: { createdAt: "DESC" },
  });
};

export const updateCourse = async (
  id: number,
  userId: number,
  role: UserRole,
  data: Partial<{
    courseTitle: string;
    courseCode: string;
    description: string;
    thumbnail: string | null;
    category: string;
    level: CourseLevel;
    duration: number;
  }>
) => {
  const courseRepository = AppDataSource.getRepository(Course);

  const course = await courseRepository.findOneBy({ id });

  if (!course) {
    throw new Error("Course not found");
  }

  if (role === UserRole.INSTRUCTOR && course.instructorId !== userId) {
    throw new Error("You cannot update this course");
  }

  if (data.courseCode && data.courseCode !== course.courseCode) {
    const existing = await courseRepository.findOneBy({
      courseCode: data.courseCode,
    });

    if (existing) {
      throw new Error("Course code already exists");
    }
  }

  Object.assign(course, data);

  return await courseRepository.save(course);
};

export const updateCourseStatus = async (
  id: number,
  userId: number,
  role: UserRole,
  status: CourseStatus
) => {
  const courseRepository = AppDataSource.getRepository(Course);

  const course = await courseRepository.findOneBy({ id });

  if (!course) {
    throw new Error("Course not found");
  }

  if (role === UserRole.INSTRUCTOR && course.instructorId !== userId) {
    throw new Error("You cannot update this course");
  }

  course.status = status;

  return await courseRepository.save(course);
};

export const deleteCourse = async (
  id: number,
  userId: number,
  role: UserRole
) => {
  const courseRepository = AppDataSource.getRepository(Course);

  const course = await courseRepository.findOneBy({ id });

  if (!course) {
    throw new Error("Course not found");
  }

  if (role === UserRole.INSTRUCTOR && course.instructorId !== userId) {
    throw new Error("You cannot delete this course");
  }

  await courseRepository.remove(course);

  return true;
};

export const getPublishedCourses = async () => {
  const courseRepository = AppDataSource.getRepository(Course);

  return await courseRepository.find({
    where: {
      status: CourseStatus.PUBLISHED,
    },
    relations: {
      instructor: true,
    },
    order: {
      createdAt: "DESC",
    },
  });
};