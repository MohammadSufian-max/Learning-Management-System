
import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  Circle,
  CalendarDays,
} from "lucide-react";
import {
  getMyEnrollments,
  getCourseProgress,
} from "../dashboard/dashboardApi";

function formatDate(date: string | null) {
  if (!date) return null;

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function LearningProgressPage() {
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
    [enrollments]
  );

  const progressQueries = useQueries({
    queries: activeEnrollments.map((enrollment) => ({
      queryKey: ["course-progress", enrollment.courseId],
      queryFn: () => getCourseProgress(enrollment.courseId),
    })),
  });

  const isProgressLoading = progressQueries.some(
    (query) => query.isLoading
  );

  const hasProgressError = progressQueries.some(
    (query) => query.isError
  );

  const totalLessons = progressQueries.reduce(
    (total, query) => total + (query.data?.totalLessons ?? 0),
    0
  );

  const completedLessons = progressQueries.reduce(
    (total, query) => total + (query.data?.completedLessons ?? 0),
    0
  );

  const pendingLessons = progressQueries.reduce(
    (total, query) => total + (query.data?.pendingLessons ?? 0),
    0
  );

  const overallProgress =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  if (isLoading || isProgressLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        Unable to load your learning progress. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Track Your Learning
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
          Learning Progress
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Monitor your completed and pending lessons across enrolled courses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Enrolled Courses"
          value={enrollments.length}
          icon={<GraduationCap className="h-5 w-5" />}
        />
        <StatCard
          title="Total Lessons"
          value={totalLessons}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          title="Completed Lessons"
          value={completedLessons}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Lessons"
          value={pendingLessons}
          icon={<Clock3 className="h-5 w-5" />}
        />
      </div>

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">
            Course-wise Progress
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Your learning progress for each enrolled course.
          </p>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-stone-400" />
            <h3 className="mt-4 font-semibold text-stone-800">
              No enrolled courses
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              Enroll in a course to start tracking your progress.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const isCompleted = enrollment.status === "completed";

              const queryIndex = activeEnrollments.findIndex(
                (item) => item.courseId === enrollment.courseId
              );

              const progressData =
                queryIndex >= 0
                  ? progressQueries[queryIndex]?.data
                  : undefined;

              const percentage = isCompleted
                ? 100
                : progressData?.progressPercentage ?? 0;

              return (
                <div
                  key={enrollment.id}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <GraduationCap className="h-8 w-8 text-emerald-700" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-stone-900">
                          {course.courseTitle}
                        </h3>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
                          {enrollment.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-stone-500">
                        {course.courseCode}
                      </p>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-stone-500">
                            Overall Progress
                          </span>
                          <span className="font-semibold text-emerald-700">
                            {percentage}%
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {isCompleted ? (
                        <p className="mt-3 text-sm text-emerald-700">
                          Course marked as completed.
                        </p>
                      ) : progressData ? (
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-500">
                          <span>
                            Completed: {progressData.completedLessons}
                          </span>
                          <span>
                            Pending: {progressData.pendingLessons}
                          </span>
                          <span>
                            Total: {progressData.totalLessons}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {!isCompleted && progressData?.lessons && (
                    <div className="mt-6 border-t border-stone-100 pt-5">
                      <h4 className="mb-4 font-semibold text-stone-800">
                        Lesson Details
                      </h4>

                      {progressData.lessons.length === 0 ? (
                        <p className="text-sm text-stone-500">
                          No lessons available in this course yet.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {progressData.lessons.map((lesson) => (
                            <div
                              key={lesson.lessonId}
                              className="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50 p-4"
                            >
                              {lesson.isCompleted ? (
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                              ) : (
                                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" />
                              )}

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-stone-800">
                                  Lesson {lesson.sequenceNumber}: {lesson.lessonTitle}
                                </p>

                                {lesson.isCompleted ? (
                                  <div className="mt-1 flex items-center gap-1 text-xs text-emerald-700">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Completed
                                    {lesson.completedAt &&
                                      ` on ${formatDate(lesson.completedAt)}`}
                                  </div>
                                ) : (
                                  <p className="mt-1 text-xs text-stone-500">
                                    Pending
                                  </p>
                                )}
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                                  lesson.isCompleted
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-stone-200 text-stone-600"
                                }`}
                              >
                                {lesson.isCompleted ? "Completed" : "Pending"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {hasProgressError && (
          <p className="text-sm text-red-600">
            Some course progress data could not be loaded.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">
          Overall Learning Progress
        </h2>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-stone-500">
            Across active courses
          </span>
          <span className="text-xl font-bold text-emerald-700">
            {overallProgress}%
          </span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-stone-500">
          {completedLessons} of {totalLessons} lessons completed.
        </p>
      </section>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">{title}</p>
        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

export default LearningProgressPage;
