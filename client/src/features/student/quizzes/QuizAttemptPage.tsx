import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Check,
  Clock,
  GraduationCap,
  LayoutDashboard,
  List,
  Loader2,
  Save,
  Send,
  Trophy,
} from "lucide-react";

import {
  getStudentQuizQuestions,
  startQuizAttempt,
  saveQuizAnswer,
  submitQuizAttempt,
  type QuizQuestion,
  type QuizAttempt,
  type QuizResult,
} from "./quizApi";

const answerSchema = z.object({
  answers: z.record(
    z.string(),
    z.enum(["A", "B", "C", "D"])
  ),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

function QuizAttemptPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const id = Number(quizId);

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const {
  setValue,
  handleSubmit,
  watch,
} = useForm<AnswerFormValues>({
  resolver: zodResolver(answerSchema),
  defaultValues: {
    answers: {},
  },
});

const selectedAnswers = watch("answers");
  const [savedAnswers, setSavedAnswers] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [message, setMessage] = useState("");

  const autoSubmitTriggered = useRef(false);

  const {
    data: questions = [],
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuery<QuizQuestion[]>({
    queryKey: ["student-quiz-questions", id],
    queryFn: () => getStudentQuizQuestions(id),
    enabled: Number.isInteger(id) && id > 0,
  });

  const startMutation = useMutation({
    mutationFn: () => startQuizAttempt(id),
    onSuccess: (data) => {
      setAttempt(data.attempt);
      setExpiresAt(data.expiresAt);
      setRemainingSeconds(data.duration * 60);
      setMessage("");
    },
    onError: (error: any) => {
      setMessage(error.response?.data?.message || "Unable to start quiz.");
    },
  });

  const submitMutation = useMutation({
    mutationFn: (attemptId: number) => submitQuizAttempt(attemptId),
    onSuccess: (data) => {
      setResult(data);
      setAttempt((previous) =>
        previous
          ? { ...previous, attemptStatus: "evaluated" }
          : previous
      );
      setExpiresAt(null);
    },
    onError: (error: any) => {
      setMessage(error.response?.data?.message || "Unable to submit quiz.");
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({
      attemptId,
      questionId,
      selectedAnswer,
    }: {
      attemptId: number;
      questionId: number;
      selectedAnswer: string;
    }) => saveQuizAnswer(attemptId, questionId, selectedAnswer),
    onSuccess: (_, variables) => {
      setSavedAnswers((previous) => ({
        ...previous,
        [variables.questionId]: true,
      }));
      setMessage("Answer saved successfully.");
    },
    onError: (error: any) => {
      setMessage(error.response?.data?.message || "Unable to save answer.");
    },
  });

  useEffect(() => {
    if (!expiresAt || result) return;

    const updateTimer = () => {
      const seconds = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
      setRemainingSeconds(seconds);
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(interval);
  }, [expiresAt, result]);

  useEffect(() => {
    if (
      remainingSeconds === 0 &&
      attempt &&
      !result &&
      !autoSubmitTriggered.current
    ) {
      autoSubmitTriggered.current = true;
      submitMutation.mutate(attempt.id);
    }
  }, [remainingSeconds, attempt, result]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  const handleStartQuiz = () => {
    autoSubmitTriggered.current = false;
    startMutation.mutate();
  };

 const handleSaveAnswer = (values: AnswerFormValues) => {
  if (!attempt) return;

  const question = questions[currentQuestion];
  const selectedAnswer = values.answers[String(question.id)];

  if (!selectedAnswer) {
    setMessage("Please select an answer first.");
    return;
  }

  setMessage("");

  saveMutation.mutate({
    attemptId: attempt.id,
    questionId: question.id,
    selectedAnswer,
  });
};

  const handleSubmitQuiz = () => {
    if (!attempt || submitMutation.isPending || result) return;

    const confirmed = window.confirm(
      "Are you sure you want to submit your quiz?"
    );

    if (confirmed) {
      autoSubmitTriggered.current = true;
      submitMutation.mutate(attempt.id);
    }
  };

  const question = questions[currentQuestion];

  const options = question
    ? [
        { key: "A", value: question.optionA },
        { key: "B", value: question.optionB },
        { key: "C", value: question.optionC },
        { key: "D", value: question.optionD },
      ].filter(
        (option): option is { key: string; value: string } =>
          Boolean(option.value)
      )
    : [];

  const answeredCount = questions.filter(
    (item) => savedAnswers[item.id]
  ).length;

  if (!Number.isInteger(id) || id <= 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f5] p-6">
        <p className="text-lg font-semibold text-red-600">
          Invalid quiz ID.
        </p>
      </div>
    );
  }

  if (questionsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f5]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (questionsError || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f5] p-6">
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
            Quiz unavailable
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {questionsError
              ? "Unable to load quiz questions. Please check your enrollment and try again."
              : "No questions are available for this quiz."}
          </p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f5] p-6">
        <div className="w-full max-w-lg rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Trophy size={32} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Quiz Result
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your quiz has been evaluated successfully.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#f8faf8] p-4">
              <p className="text-sm text-slate-500">Obtained Marks</p>
              <p className="mt-1 text-3xl font-bold text-emerald-700">
                {result.obtainedMarks}
              </p>
            </div>

            <div className="rounded-xl bg-[#f8faf8] p-4">
              <p className="text-sm text-slate-500">Total Marks</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {result.totalMarks}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-emerald-50 p-4">
            <p className="text-sm text-slate-600">Result</p>
            <p
              className={`mt-1 text-xl font-bold ${
                result.result === "pass"
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {result.result.toUpperCase()}
            </p>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Passing Marks: {result.passingMarks}
          </p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <header className="flex h-20 items-center justify-between border-b border-stone-200 bg-white px-6 md:px-10">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-9 w-9 text-emerald-800" />
            <span className="text-2xl font-bold text-slate-900">LMS</span>
          </div>
          <span className="text-sm font-medium text-slate-600">
            Student Portal
          </span>
        </header>

        <main className="mx-auto flex max-w-3xl items-center justify-center px-5 py-20">
          <div className="w-full rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
              <BookOpen size={32} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Quiz Assessment
            </h1>

            <p className="mt-3 text-slate-500">
              You are about to start this quiz. The countdown will begin
              immediately after starting.
            </p>

            <div className="mt-7 rounded-xl bg-[#f8faf8] p-5 text-left">
              <p className="text-sm text-slate-600">
                <strong>Quiz ID:</strong> {id}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                <strong>Questions:</strong> {questions.length}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                <strong>Available marks:</strong>{" "}
                {questions.reduce((sum, item) => sum + item.marks, 0)}
              </p>
            </div>

            {message && (
              <p className="mt-4 text-sm text-red-600">{message}</p>
            )}

            <button
              onClick={handleStartQuiz}
              disabled={startMutation.isPending}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-8 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60"
            >
              {startMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Start Quiz
              <ArrowRight size={18} />
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] text-slate-900">
      <header className="flex h-20 items-center justify-between border-b border-stone-200 bg-white px-5 md:px-10">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-9 w-9 text-emerald-800" />
          <span className="text-2xl font-bold">LMS</span>
        </div>

        <div className="flex items-center gap-4">
          <Bell className="h-5 w-5 text-slate-600" />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 font-semibold text-white">
            ST
          </div>
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            Student
          </span>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-5rem)]">
        <aside className="hidden w-64 shrink-0 border-r border-stone-200 bg-white px-4 py-8 lg:block">
          <nav className="space-y-2">
            {[
              { label: "Dashboard", icon: LayoutDashboard },
              { label: "Browse Courses", icon: BookOpen },
              { label: "My Courses", icon: BookOpen },
              {
                label: "Learning Progress",
                icon: ChartNoAxesColumnIncreasing,
              },
              { label: "My Quizzes", icon: List, active: true },
              { label: "Quiz Results", icon: Trophy },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                  item.active
                    ? "bg-emerald-800 text-white"
                    : "text-slate-600"
                }`}
              >
                <item.icon size={19} />
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <span>My Quizzes</span>
            <span>/</span>
            <span className="font-medium text-slate-800">
              Quiz Assessment
            </span>
          </div>

          <section className="flex flex-col justify-between gap-6 rounded-2xl border border-stone-200 border-l-4 border-l-emerald-800 bg-white p-6 shadow-sm xl:flex-row xl:items-center">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                  <BookOpen size={30} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    Quiz Assessment
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Answer all questions before the time runs out.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-slate-500">Total Marks</p>
                <p className="text-2xl font-bold text-emerald-800">
                  {attempt.totalMarks}
                </p>
              </div>

              <div className="border-l border-stone-200 pl-7">
                <div className="flex items-center gap-2 text-amber-600">
                  <Clock size={22} />
                  <span className="text-sm text-slate-500">Time Left</span>
                </div>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    remainingSeconds <= 60
                      ? "text-red-600"
                      : "text-amber-600"
                  }`}
                >
                  {formatTime(remainingSeconds)}
                </p>
              </div>
            </div>
          </section>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <List className="text-emerald-800" />
                <h2 className="font-bold">Question Navigation</h2>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {questions.length} Questions · {attempt.totalMarks} Marks
              </p>

              <div className="mt-6 grid grid-cols-5 gap-2">
                {questions.map((item, index) => {
                  const isCurrent = currentQuestion === index;
                  const isAnswered = savedAnswers[item.id];

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`flex h-11 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                        isCurrent
                          ? "border-emerald-800 bg-emerald-800 text-white"
                          : isAnswered
                            ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                            : "border-stone-300 bg-white text-slate-700 hover:border-emerald-700"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3 border-t border-stone-200 pt-5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded bg-emerald-800" />
                  Current Question
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded border border-stone-300" />
                  Not Answered
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded bg-emerald-100" />
                  Answered
                </div>
              </div>

              <p className="mt-6 text-sm text-slate-500">
                Saved: {answeredCount} / {questions.length}
              </p>
            </aside>

            <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-200 p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                    {question.marks} Marks
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-emerald-700 transition-all"
                    style={{
                      width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-6 md:p-8">
                <h2 className="text-lg font-bold leading-relaxed md:text-xl">
                  {question.question}
                </h2>

                <div className="mt-6 space-y-3">
                  {options.map((option) => {
                    const selected =
                      selectedAnswers[question.id] === option.key;

                    return (
                      <button
                        key={option.key}
                        onClick={() => {
  setValue(
    `answers.${question.id}`,
    option.key as "A" | "B" | "C" | "D",
    { shouldDirty: true }
  );

  setSavedAnswers((previous) => ({
    ...previous,
    [question.id]: false,
  }));

  setMessage("");
}}
                        className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-emerald-700 bg-emerald-50"
                            : "border-stone-200 hover:border-emerald-500"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? "border-emerald-700 bg-emerald-700 text-white"
                              : "border-slate-400"
                          }`}
                        >
                          {selected && <Check size={13} />}
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {option.value}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    {savedAnswers[question.id]
                      ? "Answer saved"
                      : "Select an option and save your answer."}
                  </span>

                  <form onSubmit={handleSubmit(handleSaveAnswer)}>
  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
    <span className="text-sm text-slate-500">
      {savedAnswers[question.id]
        ? "Answer saved"
        : "Select an option and save your answer."}
    </span>

    <button
      type="submit"
      disabled={
        saveMutation.isPending ||
        !selectedAnswers[String(question.id)] ||
        savedAnswers[question.id]
      }
      className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {saveMutation.isPending ? (
        <Loader2 size={17} className="animate-spin" />
      ) : (
        <Save size={17} />
      )}
      Save Answer
    </button>
  </div>
</form>
                </div>

                {message && (
                  <p className="mt-4 text-sm text-emerald-700">
                    {message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 p-6">
                <button
                  onClick={() =>
                    setCurrentQuestion((previous) =>
                      Math.max(0, previous - 1)
                    )
                  }
                  disabled={currentQuestion === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-sm font-semibold text-slate-600 disabled:opacity-40"
                >
                  <ArrowLeft size={17} />
                  Previous
                </button>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      setCurrentQuestion((previous) =>
                        Math.min(questions.length - 1, previous + 1)
                      )
                    }
                    disabled={currentQuestion === questions.length - 1}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 px-5 py-3 text-sm font-semibold text-emerald-800 disabled:opacity-40"
                  >
                    Next
                    <ArrowRight size={17} />
                  </button>

                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
                  >
                    {submitMutation.isPending ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Send size={17} />
                    )}
                    Submit Quiz
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default QuizAttemptPage;
