
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  ClipboardList,
  Clock3,
  CalendarDays,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getAllMyQuizAttempts,
  type StudentQuizAttempt,
} from "./quizApi";

function formatDate(date: string | null) {
  if (!date) return "Not submitted";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function QuizResultsPage() {
  const {
    data: attempts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["student-quiz-results"],
    queryFn: getAllMyQuizAttempts,
  });

  const evaluatedAttempts = attempts.filter(
    (attempt) => attempt.attemptStatus === "evaluated"
  );

  const passedAttempts = evaluatedAttempts.filter(
    (attempt) => attempt.result === "pass"
  );

  const failedAttempts = evaluatedAttempts.filter(
    (attempt) => attempt.result === "fail"
  );

  const getStatusStyle = (attempt: StudentQuizAttempt) => {
    if (attempt.attemptStatus === "in_progress") {
      return "bg-amber-50 text-amber-700";
    }

    if (attempt.attemptStatus === "submitted") {
      return "bg-blue-50 text-blue-700";
    }

    return attempt.result === "pass"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-red-50 text-red-700";
  };

  const getStatusLabel = (attempt: StudentQuizAttempt) => {
    if (attempt.attemptStatus === "in_progress") return "In Progress";
    if (attempt.attemptStatus === "submitted") return "Submitted";
    return attempt.result === "pass" ? "Pass" : "Fail";
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Performance Overview
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
          Quiz Results
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Review your quiz performance and previous attempts.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-stone-200 bg-white py-14 text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-emerald-700" />
          <p className="mt-3 text-sm text-stone-500">
            Loading quiz results...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <h3 className="mt-3 font-semibold text-stone-800">
            Unable to load results
          </h3>
          <p className="mt-2 text-sm text-stone-500">
            {error instanceof Error
              ? error.message
              : "Something went wrong."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <ClipboardList className="h-5 w-5 text-emerald-700" />
              </div>
              <p className="mt-4 text-sm text-stone-500">Total Attempts</p>
              <p className="mt-1 text-2xl font-bold text-stone-900">
                {attempts.length}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              </div>
              <p className="mt-4 text-sm text-stone-500">Passed Attempts</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {passedAttempts.length}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="mt-4 text-sm text-stone-500">Failed Attempts</p>
              <p className="mt-1 text-2xl font-bold text-red-600">
                {failedAttempts.length}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-semibold text-stone-900">
                Previous Attempts
              </h2>
            </div>

            {attempts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-emerald-700" />
                <h3 className="mt-4 font-semibold text-stone-800">
                  No quiz results yet
                </h3>
                <p className="mt-2 text-sm text-stone-500">
                  Your quiz attempts and results will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="font-semibold text-stone-900">
                          {attempt.quizTitle}
                        </h3>
                        <p className="mt-1 text-xs text-stone-500">
                          Attempt #{attempt.id} · Quiz ID: {attempt.quizId}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(attempt)}`}
                      >
                        {getStatusLabel(attempt)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-stone-100 pt-4 sm:grid-cols-4">
                      <div>
                        <p className="text-xs text-stone-500">Obtained Marks</p>
                        <p className="mt-1 font-semibold text-stone-900">
                          {attempt.obtainedMarks} / {attempt.totalMarks}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-stone-500">Result</p>
                        <p
                          className={`mt-1 font-semibold ${
                            attempt.result === "pass"
                              ? "text-emerald-700"
                              : attempt.result === "fail"
                                ? "text-red-600"
                                : "text-stone-500"
                          }`}
                        >
                          {attempt.result
                            ? attempt.result.toUpperCase()
                            : "Pending"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-stone-500">Started At</p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-stone-700">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                          {formatDate(attempt.startedAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-stone-500">Submitted At</p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-stone-700">
                          <Clock3 className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                          {formatDate(attempt.submittedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default QuizResultsPage;
