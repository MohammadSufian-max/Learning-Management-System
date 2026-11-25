
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";

// -------------------- Types --------------------

interface Course {
  id: number;
  courseTitle: string;
  courseCode: string;
}

interface CourseModule {
  id: number;
  courseId: number;
  moduleTitle: string;
  description?: string | null;
  sequenceNumber: number;
}

interface Lesson {
  id: number;
  moduleId: number;
  lessonTitle: string;
  lessonType: "video" | "pdf" | "text";
  contentUrl?: string | null;
  textContent?: string | null;
  description?: string | null;
  duration: number;
  sequenceNumber: number;
}

// -------------------- Zod Schemas --------------------

const moduleSchema = z.object({
  moduleTitle: z.string().trim().min(1, "Module title is required"),
  description: z.string().optional(),
  sequenceNumber: z.coerce
    .number()
    .int("Sequence number must be an integer")
    .positive("Sequence number must be greater than 0"),
});

type ModuleFormValues = z.infer<typeof moduleSchema>;

const lessonSchema = z
  .object({
    lessonTitle: z.string().trim().min(1, "Lesson title is required"),
    lessonType: z.enum(["video", "pdf", "text"]),
    description: z.string().optional(),
    duration: z.coerce
      .number()
      .positive("Duration must be greater than 0"),
    sequenceNumber: z.coerce
      .number()
      .int("Sequence number must be an integer")
      .positive("Sequence number must be greater than 0"),
    textContent: z.string().optional(),
    file: z.custom<File | null>(
      (value) => value === null || value instanceof File
    ),
  })
  .superRefine((values, context) => {
    if (
      (values.lessonType === "video" || values.lessonType === "pdf") &&
      !values.file
    ) {
      context.addIssue({
        code: "custom",
        message: "Please select a file",
        path: ["file"],
      });
    }

    if (
      values.lessonType === "text" &&
      !values.textContent?.trim()
    ) {
      context.addIssue({
        code: "custom",
        message: "Text content is required",
        path: ["textContent"],
      });
    }

    if (
      values.lessonType === "pdf" &&
      values.file &&
      values.file.type !== "application/pdf"
    ) {
      context.addIssue({
        code: "custom",
        message: "Please select a PDF file",
        path: ["file"],
      });
    }

    if (
      values.lessonType === "video" &&
      values.file &&
      !values.file.type.startsWith("video/")
    ) {
      context.addIssue({
        code: "custom",
        message: "Please select a video file",
        path: ["file"],
      });
    }
  });

type LessonFormValues = z.infer<typeof lessonSchema>;

// -------------------- Main Page --------------------

export default function ModulesPage() {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: async () => {
      const response = await api.get("/courses");
      return response.data.data as Course[];
    },
  });

  const {
    data: modules = [],
    isLoading: modulesLoading,
    isError: modulesError,
  } = useQuery({
    queryKey: ["course-modules", selectedCourseId],
    queryFn: async () => {
      const response = await api.get(
        `/course-modules/${selectedCourseId}`
      );
      return response.data.data as CourseModule[];
    },
    enabled: Boolean(selectedCourseId),
  });

  const moduleForm = useForm<
  z.input<typeof moduleSchema>,
  any,
  z.output<typeof moduleSchema>
>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      moduleTitle: "",
      description: "",
      sequenceNumber: 1,
    },
  });

  const createModuleMutation = useMutation({
    mutationFn: async (values: ModuleFormValues) => {
      return api.post("/course-modules", {
        courseId: Number(selectedCourseId),
        moduleTitle: values.moduleTitle,
        description: values.description,
        sequenceNumber: values.sequenceNumber,
      });
    },
    onSuccess: () => {
      moduleForm.reset({
        moduleTitle: "",
        description: "",
        sequenceNumber: modules.length + 2,
      });

      queryClient.invalidateQueries({
        queryKey: ["course-modules", selectedCourseId],
      });
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: number) => {
      return api.delete(`/course-modules/${moduleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course-modules", selectedCourseId],
      });
    },
  });

  const onCreateModule = (values: ModuleFormValues) => {
    createModuleMutation.mutate(values);
  };

  if (coursesLoading) {
    return <p className="p-6 text-gray-500">Loading courses...</p>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">
          Modules & Lessons
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage course modules and their learning content.
        </p>
      </div>

      {/* Course Selection */}

      <div className="rounded-xl border border-emerald-100 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Select Course
        </label>

        <select
          value={selectedCourseId}
          onChange={(event) => setSelectedCourseId(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600 sm:max-w-md"
        >
          <option value="">Choose a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.courseTitle} ({course.courseCode})
            </option>
          ))}
        </select>
      </div>

      {!selectedCourseId ? (
        <div className="rounded-xl border border-dashed border-emerald-200 bg-white p-10 text-center text-gray-500">
          Select a course to manage its modules and lessons.
        </div>
      ) : (
        <>
          {/* Add Module Form */}

          <form
            onSubmit={moduleForm.handleSubmit(onCreateModule)}
            className="space-y-4 rounded-xl border border-emerald-100 bg-white p-5"
          >
            <h2 className="text-lg font-semibold text-emerald-950">
              Add New Module
            </h2>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Module Title
              </label>
              <input
                {...moduleForm.register("moduleTitle")}
                placeholder="Enter module title"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
              />
              {moduleForm.formState.errors.moduleTitle && (
                <p className="mt-1 text-sm text-red-600">
                  {moduleForm.formState.errors.moduleTitle.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                {...moduleForm.register("description")}
                placeholder="Enter module description"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Sequence Number
              </label>
              <input
                type="number"
                min="1"
                {...moduleForm.register("sequenceNumber")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600 sm:max-w-xs"
              />
              {moduleForm.formState.errors.sequenceNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {moduleForm.formState.errors.sequenceNumber.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={createModuleMutation.isPending}
              className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {createModuleMutation.isPending
                ? "Creating..."
                : "Add Module"}
            </button>

            {createModuleMutation.isError && (
              <p className="text-sm text-red-600">
                Failed to create module. Please try again.
              </p>
            )}
          </form>

          {/* Module List */}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-emerald-950">
              Course Modules
            </h2>

            {modulesLoading && (
              <p className="text-gray-500">Loading modules...</p>
            )}

            {modulesError && (
              <p className="text-sm text-red-600">
                Failed to load modules.
              </p>
            )}

            {!modulesLoading && !modulesError && modules.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                No modules added to this course yet.
              </div>
            )}

            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onDelete={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this module?"
                    )
                  ) {
                    deleteModuleMutation.mutate(module.id);
                  }
                }}
                isDeleting={
                  deleteModuleMutation.isPending &&
                  deleteModuleMutation.variables === module.id
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// -------------------- Module Card & Lesson Form --------------------

interface ModuleCardProps {
  module: CourseModule;
  onDelete: () => void;
  isDeleting: boolean;
}

function ModuleCard({
  module,
  onDelete,
  isDeleting,
}: ModuleCardProps) {
  const queryClient = useQueryClient();
  const [showLessons, setShowLessons] = useState(false);

  const {
    data: lessons = [],
    isLoading: lessonsLoading,
  } = useQuery({
    queryKey: ["module-lessons", module.id],
    queryFn: async () => {
      const response = await api.get(`/lessons/module/${module.id}`);
      return response.data.data as Lesson[];
    },
    enabled: showLessons,
  });

  const lessonForm = useForm<
  z.input<typeof lessonSchema>,
  any,
  z.output<typeof lessonSchema>
>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      lessonTitle: "",
      lessonType: "video",
      description: "",
      duration: 1,
      sequenceNumber: 1,
      textContent: "",
      file: null,
    },
  });

  const selectedType = lessonForm.watch("lessonType");

  const createLessonMutation = useMutation({
    mutationFn: async (values: LessonFormValues) => {
      const formData = new FormData();

      formData.append("moduleId", String(module.id));
      formData.append("lessonTitle", values.lessonTitle);
      formData.append("lessonType", values.lessonType);
      formData.append("description", values.description || "");
      formData.append("duration", String(values.duration));
      formData.append("sequenceNumber", String(values.sequenceNumber));

      if (values.lessonType === "text") {
        formData.append("textContent", values.textContent || "");
      }

      if (values.file) {
        formData.append("file", values.file);
      }

      return api.post("/lessons", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      lessonForm.reset({
        lessonTitle: "",
        lessonType: "video",
        description: "",
        duration: 1,
        sequenceNumber: lessons.length + 2,
        textContent: "",
        file: null,
      });

      queryClient.invalidateQueries({
        queryKey: ["module-lessons", module.id],
      });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      return api.delete(`/lessons/${lessonId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-lessons", module.id],
      });
    },
  });

  const onCreateLesson = (values: LessonFormValues) => {
    createLessonMutation.mutate(values);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-medium text-amber-600">
            MODULE {module.sequenceNumber}
          </p>
          <h3 className="mt-1 font-semibold text-emerald-950">
            {module.moduleTitle}
          </h3>
          {module.description && (
            <p className="mt-1 text-sm text-gray-500">
              {module.description}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowLessons((previous) => !previous)}
            className="rounded-lg border border-emerald-700 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            {showLessons ? "Hide Lessons" : "Manage Lessons"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {showLessons && (
        <div className="space-y-5 border-t border-gray-100 bg-amber-50/30 p-5">
          <div>
            <h4 className="font-semibold text-emerald-950">
              Lessons
            </h4>

            {lessonsLoading && (
              <p className="mt-2 text-sm text-gray-500">
                Loading lessons...
              </p>
            )}

            {!lessonsLoading && lessons.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No lessons added to this module yet.
              </p>
            )}

            <div className="mt-3 space-y-2">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {lesson.sequenceNumber}. {lesson.lessonTitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lesson.lessonType} · {lesson.duration} minutes
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={deleteLessonMutation.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this lesson?"
                        )
                      ) {
                        deleteLessonMutation.mutate(lesson.id);
                      }
                    }}
                    className="text-sm text-red-600 hover:underline disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Lesson Form */}

          <form
            onSubmit={lessonForm.handleSubmit(onCreateLesson)}
            className="space-y-4 rounded-xl border border-emerald-100 bg-white p-5"
          >
            <h4 className="font-semibold text-emerald-950">
              Add New Lesson
            </h4>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Lesson Title
              </label>
              <input
                {...lessonForm.register("lessonTitle")}
                placeholder="Enter lesson title"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
              />
              {lessonForm.formState.errors.lessonTitle && (
                <p className="mt-1 text-sm text-red-600">
                  {lessonForm.formState.errors.lessonTitle.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Lesson Type
              </label>
              <select
                {...lessonForm.register("lessonType")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
              >
                <option value="video">Video</option>
<option value="pdf">PDF</option>
<option value="text">Text</option>
              </select>
            </div>

            {selectedType !== "text" ? (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Upload {selectedType === "video" ? "Video" : "PDF"}
                </label>
                <input
                  type="file"
                  accept={
                    selectedType === "video" ? "video/*" : "application/pdf"
                  }
                  onChange={(event) => {
                    lessonForm.setValue(
                      "file",
                      event.target.files?.[0] ?? null,
                      { shouldValidate: true }
                    );
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                {lessonForm.formState.errors.file && (
                  <p className="mt-1 text-sm text-red-600">
                    {lessonForm.formState.errors.file.message}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Text Content
                </label>
                <textarea
                  {...lessonForm.register("textContent")}
                  rows={5}
                  placeholder="Enter lesson content"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
                />
                {lessonForm.formState.errors.textContent && (
                  <p className="mt-1 text-sm text-red-600">
                    {lessonForm.formState.errors.textContent.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                {...lessonForm.register("description")}
                rows={2}
                placeholder="Enter lesson description"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  {...lessonForm.register("duration")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
                />
                {lessonForm.formState.errors.duration && (
                  <p className="mt-1 text-sm text-red-600">
                    {lessonForm.formState.errors.duration.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Sequence Number
                </label>
                <input
                  type="number"
                  min="1"
                  {...lessonForm.register("sequenceNumber")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
                />
                {lessonForm.formState.errors.sequenceNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {lessonForm.formState.errors.sequenceNumber.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={createLessonMutation.isPending}
              className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {createLessonMutation.isPending
                ? "Adding Lesson..."
                : "Add Lesson"}
            </button>

            {createLessonMutation.isError && (
              <p className="text-sm text-red-600">
                Failed to add lesson. Please try again.
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
