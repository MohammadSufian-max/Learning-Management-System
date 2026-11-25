import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "../../../api/axios";
import { useSearchParams } from "react-router-dom";

interface Course {
  id: number;
  courseTitle: string;
}

interface Quiz {
  id: number;
  quizTitle: string;
  courseId: number;
  status: "draft" | "published";
  totalMarks: number;
}

interface Question {
  id: number;
  quizId: number;
  question: string;
  questionType: "mcq" | "true_false";
  optionA: string;
  optionB: string;
  optionC: string | null;
  optionD: string | null;
  correctAnswer: string;
  marks: number;
  sequenceNumber: number;
}

const questionSchema = z
  .object({
    question: z.string().trim().min(1, "Question is required"),
    questionType: z.enum(["mcq", "true_false"]),
    optionA: z.string().trim().min(1, "Option A is required"),
    optionB: z.string().trim().min(1, "Option B is required"),
    optionC: z.string().optional(),
    optionD: z.string().optional(),
    correctAnswer: z.string().min(1, "Select the correct answer"),
    marks: z.number().int().min(1, "Marks must be at least 1"),
    sequenceNumber: z.number().int().min(1, "Sequence must be at least 1"),
  })
  .superRefine((data, ctx) => {
    if (data.questionType === "mcq") {
      if (!data.optionC?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["optionC"],
          message: "Option C is required",
        });
      }
      if (!data.optionD?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["optionD"],
          message: "Option D is required",
        });
      }
      if (!["A", "B", "C", "D"].includes(data.correctAnswer)) {
        ctx.addIssue({
          code: "custom",
          path: ["correctAnswer"],
          message: "Select a valid option",
        });
      }
    }

    if (
      data.questionType === "true_false" &&
      !["A", "B"].includes(data.correctAnswer)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: "Select True or False",
      });
    }
  });

type QuestionFormValues = z.infer<typeof questionSchema>;

const initialValues: QuestionFormValues = {
  question: "",
  questionType: "mcq",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  marks: 1,
  sequenceNumber: 1,
};

const inputClass =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const labelClass = "mb-1.5 block text-sm font-medium text-stone-700";

export default function QuestionsPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [selectedCourseId, setSelectedCourseId] = useState(
    searchParams.get("courseId") || "",
  );

  const [selectedQuizId, setSelectedQuizId] = useState(
    searchParams.get("quizId") || "",
  );
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: initialValues,
  });

  const questionType = watch("questionType");

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["instructor-courses"],
    queryFn: async () => {
      const response = await axiosInstance.get("/courses");
      return response.data.data;
    },
  });

  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery<Quiz[]>({
    queryKey: ["instructor-quizzes", selectedCourseId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/quizzes/course/${selectedCourseId}`,
      );
      return response.data.data;
    },
    enabled: Boolean(selectedCourseId),
  });

  const {
    data: questions = [],
    isLoading: questionsLoading,
    isError: questionsError,
  } = useQuery<Question[]>({
    queryKey: ["instructor-questions", selectedQuizId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/questions/quiz/${selectedQuizId}`,
      );
      return response.data.data;
    },
    enabled: Boolean(selectedQuizId),
  });

  useEffect(() => {
    if (!editingQuestion) {
      reset({
        ...initialValues,
        sequenceNumber: questions.length + 1,
      });
    }
  }, [questions.length, editingQuestion, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: QuestionFormValues) => {
      const payload = {
        ...values,
        optionC: values.questionType === "mcq" ? values.optionC : null,
        optionD: values.questionType === "mcq" ? values.optionD : null,
      };

      if (editingQuestion) {
        return axiosInstance.put(`/questions/${editingQuestion.id}`, payload);
      }

      return axiosInstance.post(`/questions/quiz/${selectedQuizId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructor-questions", selectedQuizId],
      });
      setEditingQuestion(null);
      setFormError("");
      reset({
        ...initialValues,
        sequenceNumber: questions.length + 2,
      });
    },
    onError: (error: any) => {
      setFormError(
        error?.response?.data?.message || "Unable to save question.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (questionId: number) =>
      axiosInstance.delete(`/questions/${questionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructor-questions", selectedQuizId],
      });
    },
    onError: (error: any) => {
      setFormError(
        error?.response?.data?.message || "Unable to delete question.",
      );
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (questionIds: number[]) =>
      axiosInstance.patch(`/questions/quiz/${selectedQuizId}/reorder`, {
        questionIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructor-questions", selectedQuizId],
      });
    },
    onError: (error: any) => {
      setFormError(
        error?.response?.data?.message || "Unable to reorder questions.",
      );
    },
  });

  const onSubmit = (values: QuestionFormValues) => {
    setFormError("");
    saveMutation.mutate(values);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormError("");

    reset({
      question: question.question,
      questionType: question.questionType,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC || "",
      optionD: question.optionD || "",
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      sequenceNumber: question.sequenceNumber,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingQuestion(null);
    setFormError("");
    reset({
      ...initialValues,
      sequenceNumber: questions.length + 1,
    });
  };

  const handleDelete = (questionId: number) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setFormError("");
      deleteMutation.mutate(questionId);
    }
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;

    if (nextIndex < 0 || nextIndex >= questions.length) return;

    const reordered = [...questions];
    [reordered[index], reordered[nextIndex]] = [
      reordered[nextIndex],
      reordered[index],
    ];

    reorderMutation.mutate(reordered.map((question) => question.id));
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourseId(value);
    setSelectedQuizId("");
    setEditingQuestion(null);
    setFormError("");
    reset(initialValues);
  };

  const handleQuizChange = (value: string) => {
    setSelectedQuizId(value);
    setEditingQuestion(null);
    setFormError("");
    reset(initialValues);
  };

  const selectedQuiz = quizzes.find(
    (quiz) => String(quiz.id) === selectedQuizId,
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Instructor Workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900 md:text-3xl">
            Questions Management
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Create, edit and organize questions for your quizzes.
          </p>
        </div>

        <div className="grid gap-4 rounded-xl border border-stone-200 bg-white p-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Select Course</label>
            <select
              className={inputClass}
              value={selectedCourseId}
              onChange={(event) => handleCourseChange(event.target.value)}
            >
              <option value="">Choose a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseTitle}
                </option>
              ))}
            </select>
            {coursesLoading && (
              <p className="mt-1 text-xs text-stone-400">Loading courses...</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Select Quiz</label>
            <select
              className={inputClass}
              value={selectedQuizId}
              onChange={(event) => handleQuizChange(event.target.value)}
              disabled={!selectedCourseId || quizzesLoading}
            >
              <option value="">Choose a quiz</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.quizTitle} ({quiz.status})
                </option>
              ))}
            </select>
            {quizzesLoading && (
              <p className="mt-1 text-xs text-stone-400">Loading quizzes...</p>
            )}
            {selectedCourseId && !quizzesLoading && quizzes.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No quizzes found for this course.
              </p>
            )}
          </div>
        </div>

        {selectedQuizId && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-sm text-stone-500">Selected Quiz</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {selectedQuiz?.quizTitle}
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-sm text-stone-500">Total Questions</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {questions.length}
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-sm text-stone-500">Quiz Total Marks</p>
                <p className="mt-1 text-2xl font-bold text-stone-900">
                  {selectedQuiz?.totalMarks ?? 0}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5 md:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">
                    {editingQuestion ? "Edit Question" : "Add New Question"}
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Add MCQ or True/False questions to this quiz.
                  </p>
                </div>
                {editingQuestion && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              {formError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className={labelClass}>Question</label>
                  <textarea
                    {...register("question")}
                    rows={3}
                    placeholder="Enter your question"
                    className={inputClass}
                  />
                  {errors.question && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.question.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>Question Type</label>
                    <select
                      {...register("questionType", {
                        onChange: (event) => {
                          const type = event.target.value;
                          setValue("correctAnswer", "A");
                          if (type === "true_false") {
                            setValue("optionA", "True");
                            setValue("optionB", "False");
                            setValue("optionC", "");
                            setValue("optionD", "");
                          } else {
                            setValue("optionA", "");
                            setValue("optionB", "");
                            setValue("optionC", "");
                            setValue("optionD", "");
                          }
                        },
                      })}
                      className={inputClass}
                    >
                      <option value="mcq">Multiple Choice (MCQ)</option>
                      <option value="true_false">True / False</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Marks</label>
                    <input
                      type="number"
                      min="1"
                      {...register("marks", { valueAsNumber: true })}
                      className={inputClass}
                    />
                    {errors.marks && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.marks.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Sequence Number</label>
                    <input
                      type="number"
                      min="1"
                      {...register("sequenceNumber", { valueAsNumber: true })}
                      className={inputClass}
                    />
                    {errors.sequenceNumber && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.sequenceNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Option A {questionType === "true_false" && "(True)"}
                    </label>
                    <input
                      {...register("optionA")}
                      className={inputClass}
                      placeholder="Option A"
                      readOnly={questionType === "true_false"}
                    />
                    {errors.optionA && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.optionA.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Option B {questionType === "true_false" && "(False)"}
                    </label>
                    <input
                      {...register("optionB")}
                      className={inputClass}
                      placeholder="Option B"
                      readOnly={questionType === "true_false"}
                    />
                    {errors.optionB && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.optionB.message}
                      </p>
                    )}
                  </div>

                  {questionType === "mcq" && (
                    <>
                      <div>
                        <label className={labelClass}>Option C</label>
                        <input
                          {...register("optionC")}
                          className={inputClass}
                          placeholder="Option C"
                        />
                        {errors.optionC && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.optionC.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass}>Option D</label>
                        <input
                          {...register("optionD")}
                          className={inputClass}
                          placeholder="Option D"
                        />
                        {errors.optionD && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.optionD.message}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="max-w-sm">
                  <label className={labelClass}>Correct Answer</label>
                  <select {...register("correctAnswer")} className={inputClass}>
                    <option value="A">
                      {questionType === "true_false" ? "True" : "Option A"}
                    </option>
                    <option value="B">
                      {questionType === "true_false" ? "False" : "Option B"}
                    </option>
                    {questionType === "mcq" && (
                      <>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </>
                    )}
                  </select>
                  {errors.correctAnswer && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.correctAnswer.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end border-t border-stone-100 pt-4">
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saveMutation.isPending
                      ? "Saving..."
                      : editingQuestion
                        ? "Update Question"
                        : "Add Question"}
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-stone-900">
                  Questions List
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Manage the questions and their sequence in this quiz.
                </p>
              </div>

              {questionsLoading ? (
                <p className="py-8 text-center text-sm text-stone-500">
                  Loading questions...
                </p>
              ) : questionsError ? (
                <p className="py-8 text-center text-sm text-red-600">
                  Unable to load questions. Please refresh and try again.
                </p>
              ) : questions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-stone-300 py-10 text-center">
                  <p className="font-medium text-stone-700">
                    No questions added yet
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    Use the form above to add the first question.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="rounded-lg border border-stone-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                              Question {question.sequenceNumber}
                            </span>
                            <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
                              {question.questionType === "mcq"
                                ? "MCQ"
                                : "True / False"}
                            </span>
                            <span className="text-xs text-stone-500">
                              {question.marks} marks
                            </span>
                          </div>

                          <p className="font-medium text-stone-900">
                            {question.question}
                          </p>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {[
                              ["A", question.optionA],
                              ["B", question.optionB],
                              ["C", question.optionC],
                              ["D", question.optionD],
                            ]
                              .filter((option) => Boolean(option[1]))
                              .map(([key, value]) => (
                                <p
                                  key={key}
                                  className={`rounded-md px-3 py-2 text-sm ${
                                    question.correctAnswer === key
                                      ? "bg-emerald-50 text-emerald-800"
                                      : "bg-stone-50 text-stone-600"
                                  }`}
                                >
                                  <span className="font-semibold">{key}.</span>{" "}
                                  {value}
                                  {question.correctAnswer === key && (
                                    <span className="ml-2 text-xs font-semibold">
                                      Correct
                                    </span>
                                  )}
                                </p>
                              ))}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-1">
                          <button
                            type="button"
                            title="Move up"
                            disabled={index === 0 || reorderMutation.isPending}
                            onClick={() => moveQuestion(index, "up")}
                            className="rounded-md border border-stone-200 px-2.5 py-2 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            title="Move down"
                            disabled={
                              index === questions.length - 1 ||
                              reorderMutation.isPending
                            }
                            onClick={() => moveQuestion(index, "down")}
                            className="rounded-md border border-stone-200 px-2.5 py-2 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(question)}
                            className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(question.id)}
                            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!selectedQuizId && (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white py-12 text-center">
            <h3 className="font-semibold text-stone-800">
              Select a course and quiz
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              Choose a course and one of its quizzes to manage questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
