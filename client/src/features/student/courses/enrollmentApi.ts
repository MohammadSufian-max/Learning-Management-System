
import api from "../../../api/axios";
import type { Enrollment } from "../dashboard/dashboardApi";

export const enrollInCourse = async (
  courseId: number
): Promise<Enrollment> => {
  const response = await api.post("/enrollments", { courseId });
  return response.data.data;
};

export const getStudentEnrollments = async (): Promise<Enrollment[]> => {
  const response = await api.get("/enrollments/my");
  return response.data.data;
};
