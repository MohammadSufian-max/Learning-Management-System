
import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  Clock,
  FileQuestion,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";

// Types

interface Course {
  id: number;
  courseTitle: string;
  courseCode: string;
}

interface CourseModule {
  id: number;
  courseId: number;
  moduleTitle: string;
  sequenceNumber: number;
}

interface Quiz {
  id: number;
  courseId: number;
  moduleId: number | null;
  quizTitle: string;
  description: string | null;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  status: "draft" | "published";
  createdAt: string;
}

// Validation

const quizSchema = z
  .object({
    courseId: z.string().min(1, "Please select a course"),
    moduleId: z.string(),
    quizTitle: z
      .string()
      .trim()
      .min(1, "Quiz title is required")
      .max(200, "Maximum 200 characters allowed"),
    description: z.string().optional(),
    duration: z.coerce
      .number()
      .int()
      .positive("Duration must be greater than 0"),
    totalMarks: z.coerce
      .number()
      .int()
      .positive("Total marks must be greater than 0"),
    passingMarks: z.coerce
      .number()
      .int()
      .min(0, "Passing marks cannot be negative"),
  })
  .refine((values) => values.passingMarks <= values.totalMarks, {
    message: "Passing marks cannot exceed total marks",
    path: ["passingMarks"],
  });

type QuizFormValues = z.input<typeof quizSchema>;
type ParsedQuizValues = z.output<typeof quizSchema>;

const emptyValues: QuizFormValues = {
  courseId: "",
  moduleId: "",
  quizTitle: "",
  description: "",
  duration: 30,
  totalMarks: 10,
  passingMarks: 5,
};

export default function QuizzesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const form = useForm<QuizFormValues, any, ParsedQuizValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: emptyValues,
  });

  const watchedCourseId = form.watch("courseId");

  // Fetch instructor courses

  const {
    data: courses = [],
    isLoading: coursesLoading,
  } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: async (): Promise<Course[]> => {
      const response = await api.get("/courses");
      return response.data.data;
    },
  });

  // Fetch modules for selected course

  const {
    data: modules = [],
    isLoading: modulesLoading,
  } = useQuery({
    queryKey: ["course-modules", watchedCourseId],
    queryFn: async (): Promise<CourseModule[]> => {
      const response = await api.get(
        `/course-modules/${watchedCourseId}`
      );
      return response.data.data;
    },
    enabled: Boolean(watchedCourseId),
  });

  // Fetch quizzes for selected course

  const {
    data: quizzes = [],
    isLoading: quizzesLoading,
    isError: quizzesError,
  } = useQuery({
    queryKey: ["instructor-quizzes", selectedCourseId],
    queryFn: async (): Promise<Quiz[]> => {
      const response = await api.get(
        `/quizzes/course/${selectedCourseId}`
      );
      return response.data.data;
    },
    enabled: Boolean(selectedCourseId),
  });

  // Reset module when course changes

  useEffect(() => {
    if (!editingQuiz) {
      form.setValue("moduleId", "");
    }
  }, [watchedCourseId, editingQuiz, form]);

  // Create or update quiz

  const saveMutation = useMutation({
    mutationFn: async (values: ParsedQuizValues) => {
      const payload = {
        courseId: Number(values.courseId),
        moduleId: values.moduleId
          ? Number(values.moduleId)
          : null,
        quizTitle: values.quizTitle,
        description: values.description || "",
        duration: values.duration,
        totalMarks: values.totalMarks,
        passingMarks: values.passingMarks,
      };

      if (editingQuiz) {
        return api.put(`/quizzes/${editingQuiz.id}`, payload);
      }

      return api.post("/quizzes", payload);
    },
    onSuccess: (_, variables) => {
      const courseId = Number(variables.courseId);

      queryClient.invalidateQueries({
        queryKey: ["instructor-quizzes", String(courseId)],
      });

      setSelectedCourseId(String(courseId));
      setEditingQuiz(null);
      form.reset(emptyValues);
    },
  });

  // Change quiz status

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "draft" | "published";
    }) => {
      return api.patch(`/quizzes/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructor-quizzes", selectedCourseId],
      });
    },
  });

  // Delete quiz

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/quizzes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructor-quizzes", selectedCourseId],
      });
    },
  });

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);

    form.reset({
      courseId: String(quiz.courseId),
      moduleId: quiz.moduleId ? String(quiz.moduleId) : "",
      quizTitle: quiz.quizTitle,
      description: quiz.description || "",
      duration: quiz.duration,
      totalMarks: quiz.totalMarks,
      passingMarks: quiz.passingMarks,
    });
  };

  const handleCancelEdit = () => {
    setEditingQuiz(null);
    form.reset(emptyValues);
  };

  const onSubmit = (values: ParsedQuizValues) => {
    saveMutation.mutate(values);
  };

  if (coursesLoading) {
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
        <p className="text-sm font-medium text-emerald-700">
          Instructor Workspace
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
          Quizzes & Questions
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Create and manage assessments for your courses.
        </p>
      </div>

      {/* Create Quiz Form */}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
            <Plus size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-stone-900">
              {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
            </h2>
            <p className="text-sm text-stone-500">
              Enter the assessment details below.
            </p>
          </div>
        </div>

        {/* Course */}

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">
            Course *
          </label>

          <select
            {...form.register("courseId")}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-600"
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseTitle} ({course.courseCode})
              </option>
            ))}
          </select>

          {form.formState.errors.courseId && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.courseId.message}
            </p>
          )}
        </div>

        {/* Module */}

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">
            Module (Optional)
          </label>

          <select
            {...form.register("moduleId")}
            disabled={!watchedCourseId || modulesLoading}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-600 disabled:bg-stone-50"
          >
            <option value="">
              {modulesLoading ? "Loading modules..." : "No specific module"}
            </option>

            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.moduleTitle}
              </option>
            ))}
          </select>
        </div>

        {/* Quiz Title */}

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">
            Quiz Title *
          </label>

          <input
            {...form.register("quizTitle")}
            placeholder="Enter quiz title"
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-emerald-600"
          />

          {form.formState.errors.quizTitle && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.quizTitle.message}
            </p>
          )}
        </div>

        {/* Description */}

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">
            Description
          </label>

          <textarea
            {...form.register("description")}
            rows={3}
            placeholder="Enter quiz description"
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-emerald-600"
          />
        </div>

        {/* Marks and Duration */}

        <div className="grid gap-4 sm:grid-cols-3">

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Duration (Minutes) *
            </label>

            <input
              type="number"
              min="1"
              {...form.register("duration")}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-emerald-600"
            />

            {form.formState.errors.duration && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.duration.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Total Marks *
            </label>

            <input
              type="number"
              min="1"
              {...form.register("totalMarks")}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-emerald-600"
            />

            {form.formState.errors.totalMarks && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.totalMarks.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Passing Marks *
            </label>

            <input
              type="number"
              min="0"
              {...form.register("passingMarks")}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-emerald-600"
            />

            {form.formState.errors.passingMarks && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.passingMarks.message}
              </p>
            )}
          </div>

        </div>

        {/* Mutation Errors */}

        {saveMutation.isError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {(
              saveMutation.error as {
                response?: { data?: { message?: string } };
              }
            ).response?.data?.message || "Unable to save quiz. Please try again."}
          </p>
        )}

        {/* Actions */}

        <div className="flex flex-wrap gap-3 border-t border-stone-100 pt-4">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60"
          >
            {saveMutation.isPending ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Plus size={17} />
            )}

            {editingQuiz ? "Update Quiz" : "Create Quiz"}
          </button>

          {editingQuiz && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              <X size={17} />
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Quiz Listing */}

      <section className="space-y-5">

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              Course Quizzes
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              View and manage your created assessments.
            </p>
          </div>

          <select
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-600"
          >
            <option value="">Select Course to View Quizzes</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseTitle}
              </option>
            ))}
          </select>
        </div>

        {!selectedCourseId ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-stone-400" />
            <p className="mt-3 font-medium text-stone-700">
              Select a course to view its quizzes.
            </p>
          </div>
        ) : quizzesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          </div>
        ) : quizzesError ? (
          <div className="rounded-xl bg-red-50 p-5 text-red-600">
            Unable to load quizzes.
          </div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <FileQuestion className="mx-auto h-12 w-12 text-stone-400" />
            <p className="mt-3 font-medium text-stone-700">
              No quizzes created for this course yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {quizzes.map((quiz) => (
              <article
                key={quiz.id}
                className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
                      <FileQuestion size={23} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-stone-900">
                        {quiz.quizTitle}
                      </h3>
                      <p className="text-xs text-stone-500">
                        Quiz ID: {quiz.id}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      quiz.status === "published"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {quiz.status}
                  </span>
                </div>

                <p className="text-sm text-stone-500">
                  {quiz.description || "No description available."}
                </p>

                <div className="grid grid-cols-3 gap-3 border-y border-stone-100 py-4">
                  <div>
                    <Clock size={17} className="text-emerald-700" />
                    <p className="mt-1 text-sm font-semibold text-stone-800">
                      {quiz.duration} min
                    </p>
                    <p className="text-xs text-stone-500">Duration</p>
                  </div>

                  <div>
                    <BookOpen size={17} className="text-emerald-700" />
                    <p className="mt-1 text-sm font-semibold text-stone-800">
                      {quiz.totalMarks}
                    </p>
                    <p className="text-xs text-stone-500">Total Marks</p>
                  </div>

                  <div>
                    <FileQuestion size={17} className="text-emerald-700" />
                    <p className="mt-1 text-sm font-semibold text-stone-800">
                      {quiz.passingMarks}
                    </p>
                    <p className="text-xs text-stone-500">Passing Marks</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(quiz)}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({
                        id: quiz.id,
                        status:
                          quiz.status === "published"
                            ? "draft"
                            : "published",
                      })
                    }
                    className="rounded-lg border border-amber-500 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                  >
                    {quiz.status === "published"
                      ? "Unpublish"
                      : "Publish"}
                  </button>

                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this quiz?"
                        )
                      ) {
                        deleteMutation.mutate(quiz.id);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>

                  <button
  type="button"
  onClick={() =>
    navigate(
      `/instructor/questions?courseId=${quiz.courseId}&quizId=${quiz.id}`
    )
  }
  className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
>
  Manage Questions
</button>
                </div>
              </article>
            ))}
          </div>
        )}

        {(statusMutation.isError || deleteMutation.isError) && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            Unable to complete the requested action. Please try again.
          </p>
        )}
      </section>
    </div>
  );
}
