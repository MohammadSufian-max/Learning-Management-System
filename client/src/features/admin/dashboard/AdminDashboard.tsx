
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  UserRound,
  BookMarked,
  Clock3,
  CheckCircle2,
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
  title?: string;
  courseTitle?: string;
  status?: string;
}

interface Enrollment {
  id: number;
  status?: string;
}

function AdminDashboard() {
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

  const { data: enrollments = [], isLoading: enrollmentsLoading } =
    useQuery<Enrollment[]>({
      queryKey: ["admin-dashboard-enrollments"],
      queryFn: async () => {
        const response = await api.get("/enrollments");
        return response.data.data;
      },
    });

  const loading = usersLoading || coursesLoading || enrollmentsLoading;

  const totalStudents = users.filter(
    (user) => user.role === "student"
  ).length;

  const totalInstructors = users.filter(
    (user) => user.role === "instructor"
  ).length;

  const activeUsers = users.filter(
    (user) => user.status === "active"
  ).length;

  const publishedCourses = courses.filter(
    (course) => course.status === "published"
  ).length;

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      description: "Registered platform users",
      icon: Users,
      iconStyle: "bg-emerald-50 text-emerald-800",
    },
    {
      title: "Total Courses",
      value: courses.length,
      description: "Courses on the platform",
      icon: BookOpen,
      iconStyle: "bg-amber-50 text-amber-700",
    },
    {
      title: "Total Enrollments",
      value: enrollments.length,
      description: "Student course enrollments",
      icon: GraduationCap,
      iconStyle: "bg-blue-50 text-blue-700",
    },
    {
      title: "Active Users",
      value: activeUsers,
      description: "Currently active accounts",
      icon: Activity,
      iconStyle: "bg-green-50 text-green-700",
    },
  ];

  const roleStats = [
    {
      label: "Students",
      value: totalStudents,
      icon: GraduationCap,
      color: "bg-emerald-700",
      textColor: "text-emerald-800",
    },
    {
      label: "Instructors",
      value: totalInstructors,
      icon: UserRound,
      color: "bg-amber-500",
      textColor: "text-amber-700",
    },
    {
      label: "Administrators",
      value: users.filter((user) => user.role === "admin").length,
      icon: ShieldCheck,
      color: "bg-slate-500",
      textColor: "text-slate-700",
    },
  ];

  const maxRoleCount = Math.max(totalStudents, totalInstructors, 1);

  return (
    <div className="min-h-full space-y-7 bg-[#faf9f5] p-5 sm:p-7 lg:p-8">

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-800">
            <ShieldCheck size={16} />
            Administration
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor your platform, manage users and track learning activity.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-100 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Platform Overview
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-emerald-900 p-6 text-white shadow-sm sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium text-emerald-200">
            Learning Management System
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            Welcome to your Admin Panel
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100">
            Manage your learning platform from one place. Keep track of
            users, courses and student enrollments.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-8 -top-16 h-64 w-64 rounded-full border-[35px] border-emerald-800/70" />
        <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-emerald-800/60" />

        <div className="absolute bottom-6 right-8 hidden rounded-2xl border border-emerald-700 bg-emerald-800/70 p-4 sm:block">
          <BookMarked size={42} className="text-amber-300" />
        </div>
      </div>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Platform Statistics
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Overview of your LMS performance
            </p>
          </div>

          <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            Live Data
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <div className={`rounded-xl p-3 ${stat.iconStyle}`}>
                    <Icon size={21} />
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {loading ? "—" : stat.value}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dashboard Details */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* User Distribution */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                User Distribution
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Breakdown of registered platform users
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
              <Users size={21} />
            </div>
          </div>

          <div className="mt-7 space-y-6">
            {roleStats.map((role) => {
              const Icon = role.icon;
              const percentage =
                users.length > 0
                  ? Math.round((role.value / users.length) * 100)
                  : 0;

              return (
                <div key={role.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={17} className={role.textColor} />
                      <span className="text-sm font-medium text-slate-700">
                        {role.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">
                        {loading ? "—" : role.value}
                      </span>
                      <span className="w-10 text-right text-xs text-slate-400">
                        {loading ? "—" : `${percentage}%`}
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${role.color}`}
                      style={{
                        width: `${loading ? 0 : percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Course Overview */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Course Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Course publishing status
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <BookOpen size={21} />
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <div className="rounded-xl bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">
                  Published Courses
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold text-emerald-900">
                {loading ? "—" : publishedCourses}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <Clock3 size={18} />
                <span className="text-sm font-medium">
                  Draft / Unpublished
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold text-amber-900">
                {loading ? "—" : courses.length - publishedCourses}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">
                Total Courses
              </span>
              <span className="font-bold text-slate-900">
                {loading ? "—" : courses.length}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Platform Summary */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
              <Activity size={23} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Platform Activity Summary
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current account and enrollment overview
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:gap-10">
            <div>
              <p className="text-xs text-slate-500">Inactive Users</p>
              <p className="mt-1 text-xl font-bold text-rose-600">
                {loading ? "—" : users.length - activeUsers}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Enrollments</p>
              <p className="mt-1 text-xl font-bold text-emerald-800">
                {loading ? "—" : enrollments.length}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default AdminDashboard;
