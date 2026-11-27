
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Ban,
  Mail,
  Hash,
} from "lucide-react";

import api from "../../../api/axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrollmentDate: string;
  status: "active" | "completed" | "cancelled";
  student?: {
    id: number;
    fullName: string;
    email: string;
    mobileNumber?: string;
  };
  course?: {
    id: number;
    courseTitle: string;
    courseCode: string;
  };
}

function AdminEnrollmentsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelError, setCancelError] = useState("");

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

  const cancelMutation = useMutation({
    mutationFn: async (enrollmentId: number) => {
      return await api.patch(`/enrollments/${enrollmentId}/cancel`);
    },
    onSuccess: async () => {
      setShowCancelDialog(false);
      setSelectedEnrollment(null);
      setCancelError("");

      await queryClient.invalidateQueries({
        queryKey: ["admin-enrollments"],
      });
    },
    onError: (error: any) => {
      setCancelError(
        error?.response?.data?.message ||
          "Failed to cancel enrollment. Please try again."
      );
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

  const cancelledCount = enrollments.filter(
    (item) => item.status === "cancelled"
  ).length;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">Cancelled</p>
            <Ban className="h-5 w-5 text-red-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-stone-900">
            {cancelledCount}
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
          <option value="cancelled">Cancelled</option>
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
                    onClick={() => {
                      setCancelError("");
                      setSelectedEnrollment(enrollment);
                    }}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedEnrollment(enrollment);
                      }
                    }}
                    className="cursor-pointer transition hover:bg-emerald-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
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
                        {formatDate(enrollment.enrollmentDate)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          enrollment.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : enrollment.status === "completed"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-red-50 text-red-700"
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

      {/* Student Enrollment Details - shadcn Dialog */}

      <Dialog
        open={!!selectedEnrollment}
        onOpenChange={(open) => {
          if (!open && !cancelMutation.isPending) {
            setSelectedEnrollment(null);
            setCancelError("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enrollment Details</DialogTitle>
            <DialogDescription>
              Student and course information
            </DialogDescription>
          </DialogHeader>

          {selectedEnrollment && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-xl bg-emerald-50 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
                  <Users className="h-7 w-7 text-emerald-700" />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-bold text-stone-900">
                    {selectedEnrollment.student?.fullName || "Unknown Student"}
                  </h3>
                  <p className="mt-1 break-all text-sm text-stone-600">
                    {selectedEnrollment.student?.email || "No email available"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <GraduationCap className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
                    <p className="text-xs text-stone-500">Course</p>
                    <p className="font-semibold text-stone-800">
                      {selectedEnrollment.course?.courseTitle || "Unknown Course"}
                    </p>
                    <p className="text-sm text-stone-500">
                      {selectedEnrollment.course?.courseCode || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
                    <p className="text-xs text-stone-500">Email Address</p>
                    <p className="break-all text-sm font-medium text-stone-800">
                      {selectedEnrollment.student?.email || "Not available"}
                    </p>
                  </div>
                </div>

                {selectedEnrollment.student?.mobileNumber && (
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-5 w-5 text-emerald-700" />
                    <div>
                      <p className="text-xs text-stone-500">Mobile Number</p>
                      <p className="text-sm font-medium text-stone-800">
                        {selectedEnrollment.student.mobileNumber}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Hash className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
                    <p className="text-xs text-stone-500">Enrollment ID</p>
                    <p className="text-sm font-medium text-stone-800">
                      #{selectedEnrollment.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
                    <p className="text-xs text-stone-500">Enrollment Date</p>
                    <p className="text-sm font-medium text-stone-800">
                      {formatDate(selectedEnrollment.enrollmentDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-stone-200 p-3">
                  <span className="text-sm font-medium text-stone-600">
                    Enrollment Status
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      selectedEnrollment.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : selectedEnrollment.status === "completed"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-red-50 text-red-700"
                    }`}
                  >
                    {selectedEnrollment.status}
                  </span>
                </div>
              </div>

              {cancelError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {cancelError}
                </p>
              )}

              {selectedEnrollment.status === "active" && (
                <div className="flex justify-end border-t border-stone-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCancelDialog(true)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <Ban className="h-4 w-4" />
                    Cancel Enrollment
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancellation Confirmation - shadcn AlertDialog */}

      <AlertDialog
        open={showCancelDialog}
        onOpenChange={(open) => {
          if (!cancelMutation.isPending) {
            setShowCancelDialog(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancel Student Enrollment?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to cancel the enrollment of{" "}
              <strong>
                {selectedEnrollment?.student?.fullName || "this student"}
              </strong>
              {" "}in{" "}
              <strong>
                {selectedEnrollment?.course?.courseTitle || "this course"}
              </strong>
              ? This action will preserve the enrollment record and change its
              status to cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              Keep Enrollment
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={cancelMutation.isPending}
              onClick={(event) => {
                event.preventDefault();

                if (selectedEnrollment) {
                  cancelMutation.mutate(selectedEnrollment.id);
                }
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {cancelMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Ban className="mr-2 h-4 w-4" />
              )}
              {cancelMutation.isPending
                ? "Cancelling..."
                : "Confirm Cancellation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminEnrollmentsPage;
