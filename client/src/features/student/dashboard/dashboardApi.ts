
import api from "../../../api/axios";

export interface Course {
  id: number;
  courseTitle: string;
  courseCode: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number;
  status: "draft" | "published";
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  status: "active" | "completed";
  enrollmentDate: string;
  course: Course;
}

export interface CourseLessonProgress {
  lessonId: number;
  lessonTitle: string;
  sequenceNumber: number;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface CourseProgress {
  courseId: number;
  totalLessons: number;
  completedLessons: number;
  pendingLessons: number;
  progressPercentage: number;
  lessons: CourseLessonProgress[];
}

export const getMyEnrollments = async (): Promise<Enrollment[]> => {
  const response = await api.get("/enrollments/my");
  return response.data.data;
};

export const getCourseProgress = async (
  courseId: number
): Promise<CourseProgress> => {
  const response = await api.get(`/progress/course/${courseId}`);
  return response.data.data;
};
