
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Clock3,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { getPublishedCourses } from "./courseApi";
import { enrollInCourse, getStudentEnrollments } from "./enrollmentApi";

function BrowseCoursesPage() {
  const queryClient = useQueryClient();

  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["published-courses"],
    queryFn: getPublishedCourses,
  });

  const {
    data: enrollments = [],
    isLoading: enrollmentsLoading,
  } = useQuery({
    queryKey: ["student-enrollments"],
    queryFn: getStudentEnrollments,
  });

  const enrollmentMutation = useMutation({
    mutationFn: enrollInCourse,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["student-enrollments"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["published-courses"],
        }),
      ]);
    },
  });

  const getEnrollment = (courseId: number) =>
    enrollments.find((item) => item.courseId === courseId);

  if (isLoading || enrollmentsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p>
          {error instanceof Error
            ? error.message
            : "Unable to load courses. Please try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Explore Learning
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
          Browse Courses
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Explore available courses and find something new to learn.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-stone-800">
          Available Courses
        </h2>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          {courses.length} {courses.length === 1 ? "Course" : "Courses"}
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-stone-400" />
          <h3 className="mt-4 font-semibold text-stone-800">
            No published courses available
          </h3>
          <p className="mt-2 text-sm text-stone-500">
            Published courses will appear here when they become available.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const enrollment = getEnrollment(course.id);
            const isEnrolled = Boolean(enrollment);
            const isCompleted = enrollment?.status === "completed";
            const isSubmitting =
              enrollmentMutation.isPending &&
              enrollmentMutation.variables === course.id;

            return (
              <article
                key={course.id}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
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
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                      {course.category}
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

                  <div className="flex items-center justify-between border-t border-stone-100 pt-4 text-sm text-stone-500">
                    <span className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-emerald-700" />
                      {course.duration} {course.duration === 1 ? "Hour" : "Hours"}
                    </span>

                    <span className="font-medium text-emerald-700">
                      Published
                    </span>
                  </div>

                  {isEnrolled ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {isCompleted ? "Course Completed" : "Already Enrolled"}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => enrollmentMutation.mutate(course.id)}
                      disabled={enrollmentMutation.isPending}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </button>
                  )}

                  {enrollmentMutation.isError &&
                    enrollmentMutation.variables === course.id && (
                      <p className="text-sm text-red-600">
                        {enrollmentMutation.error instanceof Error
                          ? enrollmentMutation.error.message
                          : "Enrollment failed. Please try again."}
                      </p>
                    )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BrowseCoursesPage;
