
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Clock3,
  GraduationCap,
  Loader2,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  instructor?: {
    fullName: string;
    email: string;
  };
}

function AllCoursesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery<Course[]>({
    queryKey: ["admin-all-courses"],
    queryFn: async () => {
      const response = await api.get("/courses");
      return response.data.data;
    },
  });

  const refreshCourses = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin-all-courses"],
    });

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "draft" | "published";
    }) => {
      return api.patch(`/courses/${id}/status`, { status });
    },
    onSuccess: refreshCourses,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/courses/${id}`);
    },
    onSuccess: refreshCourses,
  });

  const filteredCourses = courses.filter((course) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      course.courseTitle.toLowerCase().includes(searchTerm) ||
      course.courseCode.toLowerCase().includes(searchTerm) ||
      course.instructor?.fullName?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;

    return matchesSearch && matchesStatus;
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
        Unable to load courses. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
            All Courses
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            View and manage courses created by all instructors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/courses/create")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </button>
      </div>

      {/* Statistics */}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">Total Courses</p>
            <BookOpen className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-3 text-3xl font-bold text-stone-900">
            {courses.length}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">Published</p>
            <Eye className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-3 text-3xl font-bold text-stone-900">
            {courses.filter((c) => c.status === "published").length}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">Draft Courses</p>
            <EyeOff className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-stone-900">
            {courses.filter((c) => c.status === "draft").length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course, code or instructor..."
            className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Course List */}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-stone-800">
          Platform Courses
        </h2>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          {filteredCourses.length} Courses
        </span>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-stone-400" />

          <h3 className="mt-4 font-semibold text-stone-800">
            No courses found
          </h3>

          <p className="mt-2 text-sm text-stone-500">
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
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

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      course.status === "published"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
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

                <div className="space-y-2 border-t border-stone-100 pt-4 text-sm text-stone-500">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-emerald-700" />
                    {course.instructor?.fullName || "Instructor unavailable"}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-emerald-700" />
                    {course.duration} Hours
                  </div>
                </div>

                {/* Actions */}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/admin/courses/edit/${course.id}`)
                    }
                    className="flex items-center gap-2 text-sm font-medium text-emerald-800 hover:text-emerald-950"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() => {
                      const nextStatus =
                        course.status === "published"
                          ? "draft"
                          : "published";

                      if (
                        !window.confirm(
                          `Change course status to ${nextStatus}?`
                        )
                      ) {
                        return;
                      }

                      statusMutation.mutate({
                        id: course.id,
                        status: nextStatus,
                      });
                    }}
                    className="text-sm font-medium text-amber-700 hover:text-amber-900 disabled:opacity-50"
                  >
                    {course.status === "published" ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (
                        !window.confirm(
                          "Are you sure you want to delete this course?"
                        )
                      ) {
                        return;
                      }

                      deleteMutation.mutate(course.id);
                    }}
                    className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {(statusMutation.isError || deleteMutation.isError) && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {(
            (statusMutation.error || deleteMutation.error) as {
              response?: { data?: { message?: string } };
            }
          )?.response?.data?.message || "Action failed. Please try again."}
        </p>
      )}
    </div>
  );
}

export default AllCoursesPage;
