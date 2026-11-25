
import api from "../../../api/axios";

export interface BrowseCourse {
  id: number;
  courseTitle: string;
  courseCode: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  instructorId: number;
  duration: number;
  status: "draft" | "published";
}

export const getPublishedCourses = async (): Promise<BrowseCourse[]> => {
  const response = await api.get("/courses/published");
  return response.data.data;
};
