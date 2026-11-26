import { useMemo, useState } from "react";
import {
  useQueries,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BookOpen,
  Clock3,
  GraduationCap,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
  BookText,
} from "lucide-react";
import { getMyEnrollments, getCourseProgress } from "../dashboard/dashboardApi";
import api from "../../../api/axios";

interface CourseModule {
  id: number;
  moduleTitle: string;
  description?: string;
  sequenceNumber: number;
}

interface CourseLesson {
  id: number;
  lessonTitle: string;
  lessonType: "video" | "pdf" | "text";
  contentUrl?: string | null;
  textContent?: string | null;
  description?: string | null;
  duration?: number;
  sequenceNumber: number;
}

function MyCoursesPage() {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(
    null,
  );

  const {
    data: enrollments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["student-enrollments"],
    queryFn: getMyEnrollments,
  });

  const activeEnrollments = useMemo(
    () => enrollments.filter((item) => item.status === "active"),
    [enrollments],
  );

  const progressQueries = useQueries({
    queries: activeEnrollments.map((enrollment) => ({
      queryKey: ["course-progress", enrollment.courseId],
      queryFn: () => getCourseProgress(enrollment.courseId),
    })),
  });

  const progressMap = useMemo(() => {
    const map = new Map<number, number>();

    activeEnrollments.forEach((enrollment, index) => {
      const progress = progressQueries[index]?.data;
      if (progress) {
        map.set(enrollment.courseId, progress.progressPercentage);
      }
    });

    return map;
  }, [activeEnrollments, progressQueries]);

  const modulesQuery = useQuery({
    queryKey: ["student-course-modules", selectedCourseId],
    queryFn: async () => {
      const response = await api.get(
        `/course-modules/student/${selectedCourseId}`,
      );
      return response.data.data as CourseModule[];
    },
    enabled: selectedCourseId !== null,
  });

  const modules = modulesQuery.data ?? [];

  const lessonQueries = useQueries({
    queries: modules.map((module) => ({
      queryKey: ["student-module-lessons", module.id],
      queryFn: async () => {
        const response = await api.get(`/lessons/student/module/${module.id}`);
        return response.data.data as CourseLesson[];
      },
    })),
  });

  const completeMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      const response = await api.patch(`/progress/lesson/${lessonId}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-progress"] });
      queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
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
        Unable to load your enrolled courses. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-medium text-emerald-700">Your Learning</p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
          My Courses
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Access your enrolled courses, study lessons and track your progress.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-stone-800">Enrolled Courses</h2>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          {enrollments.length} {enrollments.length === 1 ? "Course" : "Courses"}
        </span>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-stone-400" />
          <h3 className="mt-4 font-semibold text-stone-800">
            You haven't enrolled in any courses
          </h3>
          <p className="mt-2 text-sm text-stone-500">
            Browse available courses to start learning.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            const isCompleted = enrollment.status === "completed";
            const progress = isCompleted
              ? 100
              : (progressMap.get(enrollment.courseId) ?? 0);
            const isSelected = selectedCourseId === enrollment.courseId;

            return (
              <article
                key={enrollment.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                  isSelected
                    ? "border-emerald-500 ring-1 ring-emerald-500"
                    : "border-stone-200 hover:shadow-md"
                }`}
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
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                      {isCompleted ? "Completed" : "Active"}
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

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-stone-500">Learning Progress</span>
                      <span className="font-semibold text-stone-800">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-stone-100 pt-4 text-sm text-stone-500">
                    <span className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-emerald-700" />
                      {course.duration} Hours
                    </span>
                    {isCompleted && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourseId(
                        isSelected ? null : enrollment.courseId,
                      );
                      setSelectedLesson(null);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    {isSelected ? "Close Course" : "Resume Learning"}
                    {isSelected ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedCourseId !== null && (
        <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Course Content
            </p>
            <h2 className="mt-1 text-xl font-bold text-stone-900">
              Modules & Lessons
            </h2>
          </div>

          {modulesQuery.isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
          ) : modulesQuery.isError ? (
            <p className="text-sm text-red-600">
              Unable to load course modules.
            </p>
          ) : modules.length === 0 ? (
            <p className="text-sm text-stone-500">
              No modules have been added to this course yet.
            </p>
          ) : (
            <div className="space-y-4">
              {modules.map((module, index) => {
                const lessons = lessonQueries[index]?.data ?? [];
                const lessonLoading = lessonQueries[index]?.isLoading;
                const lessonError = lessonQueries[index]?.isError;

                return (
                  <div
                    key={module.id}
                    className="overflow-hidden rounded-xl border border-stone-200"
                  >
                    <div className="bg-emerald-50 p-4">
                      <h3 className="font-semibold text-stone-900">
                        Module {module.sequenceNumber}: {module.moduleTitle}
                      </h3>
                      {module.description && (
                        <p className="mt-1 text-sm text-stone-600">
                          {module.description}
                        </p>
                      )}
                    </div>

                    <div className="divide-y divide-stone-100">
                      {lessonLoading ? (
                        <div className="p-4">
                          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
                        </div>
                      ) : lessonError ? (
                        <p className="p-4 text-sm text-red-600">
                          Unable to load lessons for this module.
                        </p>
                      ) : lessons.length === 0 ? (
                        <p className="p-4 text-sm text-stone-500">
                          No lessons in this module yet.
                        </p>
                      ) : (
                        lessons.map((lesson) => {
                          const lessonProgress = progressQueries
                            .find((query) =>
                              query.data?.lessons?.some(
                                (item) => item.lessonId === lesson.id,
                              ),
                            )
                            ?.data?.lessons?.find(
                              (item) => item.lessonId === lesson.id,
                            );

                          const completed =
                            lessonProgress?.isCompleted ?? false;
                          const isOpen = selectedLesson?.id === lesson.id;

                          return (
                            <div key={lesson.id} className="p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedLesson(isOpen ? null : lesson)
                                  }
                                  className="flex items-center gap-3 text-left"
                                >
                                  {lesson.lessonType === "video" ? (
                                    <PlayCircle className="h-5 w-5 shrink-0 text-emerald-700" />
                                  ) : lesson.lessonType === "pdf" ? (
                                    <FileText className="h-5 w-5 shrink-0 text-emerald-700" />
                                  ) : (
                                    <BookText className="h-5 w-5 shrink-0 text-emerald-700" />
                                  )}
                                  <span>
                                    <span className="block font-medium text-stone-800">
                                      {lesson.sequenceNumber}.{" "}
                                      {lesson.lessonTitle}
                                    </span>
                                    <span className="text-xs capitalize text-stone-500">
                                      {lesson.lessonType}
                                      {lesson.duration
                                        ? ` • ${lesson.duration} min`
                                        : ""}
                                    </span>
                                  </span>
                                </button>

                                <div className="flex items-center gap-3">
                                  <span
                                    className={`text-xs font-semibold ${
                                      completed
                                        ? "text-emerald-700"
                                        : "text-amber-700"
                                    }`}
                                  >
                                    {completed ? "Completed" : "Pending"}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={
                                      completed || completeMutation.isPending
                                    }
                                    onClick={() =>
                                      completeMutation.mutate(lesson.id)
                                    }
                                    className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
                                  >
                                    {completed
                                      ? "Completed"
                                      : "Mark as Complete"}
                                  </button>
                                </div>
                              </div>

                              {isOpen && (
                                <div className="mt-4 rounded-lg bg-stone-50 p-4">
                                  {lesson.description && (
                                    <p className="mb-3 text-sm text-stone-600">
                                      {lesson.description}
                                    </p>
                                  )}

                                  {lesson.lessonType === "text" &&
                                    lesson.textContent && (
                                      <div className="whitespace-pre-wrap text-sm leading-7 text-stone-700">
                                        {lesson.textContent}
                                      </div>
                                    )}

                                  {(lesson.lessonType === "video" ||
                                    lesson.lessonType === "pdf") &&
                                    lesson.contentUrl && (
                                      <>

                                        <a
                                         href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${lesson.contentUrl}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-2 font-medium text-emerald-700 underline"
                                        >
                                          <BookOpen className="h-4 w-4" />
                                          Open {lesson.lessonType.toUpperCase()}{" "}
                                          Resource
                                        </a>
                                      </>
                                    )}

                                  {!lesson.textContent &&
                                    !lesson.contentUrl && (
                                      <p className="text-sm text-stone-500">
                                        No lesson content has been added yet.
                                      </p>
                                    )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {completeMutation.isError && (
            <p className="text-sm text-red-600">
              Unable to mark lesson as complete. Please try again.
            </p>
          )}

          {completeMutation.isSuccess && (
            <p className="text-sm font-medium text-emerald-700">
              Lesson completion saved successfully.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

export default MyCoursesPage;
