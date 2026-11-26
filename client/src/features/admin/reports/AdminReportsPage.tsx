
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Users,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  CalendarDays,
  TrendingUp,
  Loader2,
} from "lucide-react";
import api from "../../../api/axios";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

interface Course {
  id: number;
  courseTitle: string;
  courseCode: string;
  status: string;
}

interface Enrollment {
  id: number;
  enrollmentDate: string;
  status: string;
  student?: {
    fullName: string;
    email: string;
  };
  course?: {
    courseTitle: string;
    courseCode: string;
  };
}

function AdminReportsPage() {
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["admin-dashboard-users"],
    queryFn: async () => {
      const response = await api.get("/users");
      return response.data.data;
    },
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["admin-dashboard-courses"],
    queryFn: async () => {
      const response = await api.get("/courses");
      return response.data.data;
    },
  });

  const {
    data: enrollments = [],
    isLoading: enrollmentsLoading,
  } = useQuery<Enrollment[]>({
    queryKey: ["admin-dashboard-enrollments"],
    queryFn: async () => {
      const response = await api.get("/enrollments");
      return response.data.data;
    },
  });

  const loading = usersLoading || coursesLoading || enrollmentsLoading;

  const students = users.filter((user) => user.role === "student");
  const instructors = users.filter((user) => user.role === "instructor");
  const admins = users.filter((user) => user.role === "admin");

  const activeUsers = users.filter(
    (user) => user.status === "active"
  ).length;

  const inactiveUsers = users.length - activeUsers;

  const publishedCourses = courses.filter(
    (course) => course.status === "published"
  ).length;

  const draftCourses = courses.filter(
    (course) => course.status === "draft"
  ).length;

  const activeEnrollments = enrollments.filter(
    (item) => item.status === "active"
  ).length;

  const completedEnrollments = enrollments.filter(
    (item) => item.status === "completed"
  ).length;

  const roleStats = [
    { label: "Students", value: students.length, color: "bg-emerald-700" },
    { label: "Instructors", value: instructors.length, color: "bg-amber-500" },
    { label: "Administrators", value: admins.length, color: "bg-slate-500" },
  ];

  const recentEnrollments = [...enrollments]
    .sort(
      (a, b) =>
        new Date(b.enrollmentDate).getTime() -
        new Date(a.enrollmentDate).getTime()
    )
    .slice(0, 5);

  const summaryCards = [
    {
      title: "Total Users",
      value: users.length,
      description: "Registered platform accounts",
      icon: Users,
      style: "bg-emerald-50 text-emerald-800",
    },
    {
      title: "Total Courses",
      value: courses.length,
      description: "Courses on the platform",
      icon: BookOpen,
      style: "bg-amber-50 text-amber-700",
    },
    {
      title: "Total Enrollments",
      value: enrollments.length,
      description: "Student course enrollments",
      icon: GraduationCap,
      style: "bg-blue-50 text-blue-700",
    },
    {
      title: "Active Users",
      value: activeUsers,
      description: "Active platform accounts",
      icon: Activity,
      style: "bg-green-50 text-green-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-800">
          <ShieldCheck size={16} />
          Administration
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Reports / Activity
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Monitor overall platform activity and learning statistics.
        </p>
      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-stone-500">
                  {card.title}
                </p>

                <div className={`rounded-xl p-3 ${card.style}`}>
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {card.value}
              </p>

              <p className="mt-2 text-xs text-stone-500">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* User and Course Reports */}

      <div className="grid gap-5 xl:grid-cols-2">
        {/* User Distribution */}

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                User Distribution
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Registered accounts by role
              </p>
            </div>

            <Users className="h-6 w-6 text-emerald-700" />
          </div>

          <div className="mt-7 space-y-6">
            {roleStats.map((role) => {
              const percentage =
                users.length > 0
                  ? Math.round((role.value / users.length) * 100)
                  : 0;

              return (
                <div key={role.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-700">
                      {role.label}
                    </span>

                    <span className="text-sm font-semibold text-slate-900">
                      {role.value} ({percentage}%)
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={`h-full rounded-full ${role.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4 border-t border-stone-100 pt-5">
            <div>
              <p className="text-sm text-stone-500">Active Accounts</p>
              <p className="mt-1 text-2xl font-bold text-emerald-800">
                {activeUsers}
              </p>
            </div>

            <div>
              <p className="text-sm text-stone-500">Inactive Accounts</p>
              <p className="mt-1 text-2xl font-bold text-rose-600">
                {inactiveUsers}
              </p>
            </div>
          </div>
        </section>

        {/* Course Report */}

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Course Report
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Course publishing overview
              </p>
            </div>

            <BookOpen className="h-6 w-6 text-emerald-700" />
          </div>

          <div className="mt-7 space-y-5">
            <div className="rounded-xl bg-emerald-50 p-5">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 size={19} />
                <span className="text-sm font-medium">
                  Published Courses
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold text-emerald-900">
                {publishedCourses}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-5">
              <div className="flex items-center gap-2 text-amber-800">
                <Clock3 size={19} />
                <span className="text-sm font-medium">
                  Draft Courses
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold text-amber-900">
                {draftCourses}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-stone-100 pt-4">
              <span className="text-sm text-stone-500">Total Courses</span>
              <span className="font-bold text-slate-900">
                {courses.length}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Enrollment Report */}

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Enrollment Report
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Overview of student enrollment status
            </p>
          </div>

          <GraduationCap className="h-6 w-6 text-emerald-700" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-stone-50 p-5">
            <p className="text-sm text-stone-500">Total Enrollments</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {enrollments.length}
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 p-5">
            <p className="text-sm text-emerald-800">Active Enrollments</p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">
              {activeEnrollments}
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 p-5">
            <p className="text-sm text-blue-800">Completed Enrollments</p>
            <p className="mt-2 text-3xl font-bold text-blue-900">
              {completedEnrollments}
            </p>
          </div>
        </div>
      </section>

      {/* Recent Enrollment Records */}

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-700" />
            <h2 className="font-bold text-slate-900">
              Recent Enrollment Records
            </h2>
          </div>

          <p className="mt-1 text-sm text-stone-500">
            Latest five enrollment records, ordered by enrollment date
          </p>
        </div>

        {recentEnrollments.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-stone-500">
            No enrollment records available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Student</th>
                  <th className="px-5 py-4 font-semibold">Course</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {recentEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-stone-50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {enrollment.student?.fullName || "Unknown Student"}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {enrollment.student?.email || "No email"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {enrollment.course?.courseTitle || "Unknown Course"}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {enrollment.course?.courseCode || "N/A"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <CalendarDays size={15} />
                        {new Date(enrollment.enrollmentDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          enrollment.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {enrollment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminReportsPage;
