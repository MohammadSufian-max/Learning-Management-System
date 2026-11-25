
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock3, GraduationCap, Loader2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";

interface Course {
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

function MyCoursesPage() {
  const { data: courses = [], isLoading, isError } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: async (): Promise<Course[]> => {
      const response = await api.get("/courses");
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        Unable to load your courses. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Instructor Workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
            My Courses
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            View and manage your assigned courses.
          </p>
        </div>

        <Link
          to="/instructor/courses/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-stone-800">Your Courses</h2>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          {courses.length} {courses.length === 1 ? "Course" : "Courses"}
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-stone-400" />
          <h3 className="mt-4 font-semibold text-stone-800">
            No courses created yet
          </h3>
          <p className="mt-2 text-sm text-stone-500">
            Create your first course to start adding learning content.
          </p>
          <Link
            to="/instructor/courses/create"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.courseTitle}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-emerald-50">
                  <GraduationCap className="h-14 w-14 text-emerald-700" />
                </div>
              )}

              <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
                    {course.level}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    course.status === "published"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-800"
                  }`}>
                    {course.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-stone-900">
                    {course.courseTitle}
                  </h3>
                  <p className="mt-1 text-xs text-stone-500">
                    Course Code: {course.courseCode}
                  </p>
                </div>

                <p className="min-h-12 text-sm leading-6 text-stone-600">
                  {course.description || "No course description available."}
                </p>

                <div className="flex items-center gap-2 border-t border-stone-100 pt-4 text-sm text-stone-500">
                  <Clock3 className="h-4 w-4 text-emerald-700" />
                  {course.duration} Hours
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCoursesPage;
