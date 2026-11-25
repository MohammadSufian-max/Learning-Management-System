
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  Users,
  GraduationCap,
} from "lucide-react";
import api from "../../../api/axios";

interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrollmentDate: string;
  status: "active" | "completed";
  student?: {
    id: number;
    fullName: string;
    email: string;
  };
  course?: {
    id: number;
    courseTitle: string;
    courseCode: string;
  };
}

function AdminEnrollmentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: enrollments = [],
    isLoading,
    isError,
  } = useQuery<Enrollment[]>({
    queryKey: ["admin-enrollments"],
    queryFn: async () => {
      const response = await api.get("/enrollments");
      return response.data.data;
    },
  });

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      enrollment.student?.fullName?.toLowerCase().includes(searchTerm) ||
      enrollment.student?.email?.toLowerCase().includes(searchTerm) ||
      enrollment.course?.courseTitle?.toLowerCase().includes(searchTerm) ||
      enrollment.course?.courseCode?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || enrollment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = enrollments.filter(
    (item) => item.status === "active"
  ).length;

  const completedCount = enrollments.filter(
    (item) => item.status === "completed"
  ).length;

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
        Unable to load enrollments. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}

      <div>
        <p className="text-sm font-medium text-emerald-700">
          Administration
        </p>

        <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
          Enrollments
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Monitor student enrollments across all courses.
        </p>
      </div>

      {/* Statistics */}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">Total Enrollments</p>
            <Users className="h-5 w-5 text-emerald-700" />
          </div>

          <p className="mt-3 text-3xl font-bold text-stone-900">
            {enrollments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">Active</p>
            <Clock3 className="h-5 w-5 text-emerald-700" />
          </div>

          <p className="mt-3 text-3xl font-bold text-stone-900">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">Completed</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
          </div>

          <p className="mt-3 text-3xl font-bold text-stone-900">
            {completedCount}
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
            placeholder="Search student or course..."
            className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Enrollment Table */}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-100 p-5">
          <h2 className="font-semibold text-stone-800">
            All Student Enrollments
          </h2>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            {filteredEnrollments.length} Records
          </span>
        </div>

        {filteredEnrollments.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-stone-400" />

            <h3 className="mt-4 font-semibold text-stone-800">
              No enrollments found
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Student</th>
                  <th className="px-5 py-4 font-semibold">Course</th>
                  <th className="px-5 py-4 font-semibold">Enrollment Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {filteredEnrollments.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    className="transition hover:bg-stone-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                          <Users className="h-5 w-5 text-emerald-700" />
                        </div>

                        <div>
                          <p className="font-medium text-stone-800">
                            {enrollment.student?.fullName || "Unknown Student"}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            {enrollment.student?.email || "No email available"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-emerald-700" />

                        <div>
                          <p className="font-medium text-stone-800">
                            {enrollment.course?.courseTitle || "Unknown Course"}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            {enrollment.course?.courseCode || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-stone-600">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-stone-400" />
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
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
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
      </div>
    </div>
  );
}

export default AdminEnrollmentsPage;
