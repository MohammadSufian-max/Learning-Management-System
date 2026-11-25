
import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { getMyEnrollments, getCourseProgress } from "./dashboardApi";

function StudentDashboard() {
  const {
    data: enrollments = [],
    isLoading,
    isError,
    error,
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

  const completedCourses = enrollments.filter(
    (item) => item.status === "completed"
  ).length;

  const averageProgress =
    progressMap.size > 0
      ? Math.round(
          Array.from(progressMap.values()).reduce(
            (total, value) => total + value,
            0
          ) / progressMap.size
        )
      : 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error instanceof Error
          ? error.message
          : "Unable to load your dashboard. Please try again."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Student Overview
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
          Welcome back!
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Track your learning journey and continue where you left off.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Enrolled Courses"
          value={enrollments.length}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          title="Active Courses"
          value={activeEnrollments.length}
          icon={<GraduationCap className="h-5 w-5" />}
        />
        <StatCard
          title="Completed Courses"
          value={completedCourses}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Average Progress"
          value={`${averageProgress}%`}
          icon={<Clock3 className="h-5 w-5" />}
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              My Learning
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Continue learning from your enrolled courses.
            </p>
          </div>

          <a
            href="/student/my-courses"
            className="hidden items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800 sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-stone-400" />
            <h3 className="mt-4 font-semibold text-stone-800">
              No courses enrolled yet
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              Browse available courses and start your learning journey.
            </p>
            <a
              href="/student/courses"
              className="mt-5 inline-flex rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Browse Courses
            </a>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const progress =
                enrollment.status === "completed"
                  ? 100
                  : progressMap.get(enrollment.courseId) ?? 0;

              return (
                <div
                  key={enrollment.id}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                >
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.courseTitle}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-emerald-50">
                      <BookOpen className="h-12 w-12 text-emerald-700" />
                    </div>
                  )}

                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-stone-900">
                          {course.courseTitle}
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                          {course.courseCode} · {course.level}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
                        {enrollment.status}
                      </span>
                    </div>

                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-stone-500">Course progress</span>
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

                    <a
                      href="/student/my-courses"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Continue Learning
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
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

export default StudentDashboard;
