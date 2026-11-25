
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Clock3,
  GraduationCap,
  Loader2,
  AlertCircle,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStudentQuizzes } from "./quizApi";

function MyQuizzesPage() {
  const navigate = useNavigate();

  const {
    data: quizzes = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["student-quizzes"],
    queryFn: getStudentQuizzes,
  });

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Test Your Knowledge
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
          My Quizzes
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          View and attempt quizzes from your enrolled courses.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-emerald-700" />
          <p className="mt-3 text-sm text-stone-500">Loading quizzes...</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <h3 className="mt-3 font-semibold text-stone-800">
            Unable to load quizzes
          </h3>
          <p className="mt-2 text-sm text-stone-500">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-emerald-700" />
          <h3 className="mt-4 font-semibold text-stone-800">
            No quizzes available
          </h3>
          <p className="mt-2 text-sm text-stone-500">
            Published quizzes from your enrolled courses will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <BookOpen className="h-5 w-5 text-emerald-700" />
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Published
                </span>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-stone-900">
                {quiz.quizTitle}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {quiz.courseTitle}
              </p>

              {quiz.description && (
                <p className="mt-3 text-sm text-stone-600">
                  {quiz.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-4 border-t border-stone-100 pt-4 text-sm text-stone-600">
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-emerald-700" />
                  {quiz.duration} minutes
                </span>
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-700" />
                  {quiz.totalMarks} marks
                </span>
              </div>

              <button
                onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
              >
                Attempt Quiz
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyQuizzesPage;
