
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, RefreshCw, Users, ClipboardList } from "lucide-react";
import api from "../../../api/axios";

interface InstructorQuizResult {
  attemptId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  quizId: number;
  quizTitle: string;
  obtainedMarks: number;
  totalMarks: number;
  result: "pass" | "fail" | null;
  submittedAt: string | null;
}

function InstructorResultsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const {
    data: results = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<InstructorQuizResult[]>({
    queryKey: ["instructor-quiz-results"],
    queryFn: async () => {
      const response = await api.get("/quiz-attempts/instructor/results");
      return response.data.data;
    },
  });

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const searchMatch =
        item.studentName.toLowerCase().includes(search.toLowerCase()) ||
        item.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
        item.quizTitle.toLowerCase().includes(search.toLowerCase());

      const filterMatch =
        filter === "all" || item.result === filter;

      return searchMatch && filterMatch;
    });
  }, [results, search, filter]);

  const totalAttempts = results.length;
  const passedAttempts = results.filter(
    (item) => item.result === "pass"
  ).length;
  const failedAttempts = results.filter(
    (item) => item.result === "fail"
  ).length;

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Student Results
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View quiz performance and results of your students.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Attempts</p>
            <ClipboardList className="text-emerald-700" size={22} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {totalAttempts}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Passed</p>
            <Users className="text-emerald-700" size={22} />
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-700">
            {passedAttempts}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Failed</p>
            <Users className="text-red-600" size={22} />
          </div>
          <p className="mt-3 text-3xl font-bold text-red-600">
            {failedAttempts}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or quiz..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-600"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
          >
            <option value="all">All Results</option>
            <option value="pass">Passed</option>
            <option value="fail">Failed</option>
          </select>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-500">
            Loading student results...
          </p>
        ) : isError ? (
          <div className="py-10 text-center">
            <p className="text-sm text-red-600">
              Failed to load student results.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-sm font-medium text-emerald-700"
            >
              Try again
            </button>
          </div>
        ) : filteredResults.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            No quiz results found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5 text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Quiz</th>
                  <th className="px-4 py-3">Marks</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Submitted At</th>
                </tr>
              </thead>

              <tbody>
                {filteredResults.map((item) => (
                  <tr
                    key={item.attemptId}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">
                        {item.studentName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.studentEmail}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {item.quizTitle}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                      {item.obtainedMarks} / {item.totalMarks}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.result === "pass"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.result === "pass" ? "Passed" : "Failed"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-500">
                      {formatDate(item.submittedAt)}
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

export default InstructorResultsPage;
