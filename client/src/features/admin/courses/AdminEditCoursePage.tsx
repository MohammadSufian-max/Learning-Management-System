
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save, GraduationCap } from "lucide-react";
import api from "../../../api/axios";

const courseSchema = z.object({
  courseTitle: z.string().trim().min(1, "Course title is required").max(150),
  courseCode: z.string().trim().min(1, "Course code is required"),
  description: z.string().optional(),
  thumbnail: z.string().trim().refine(
    (value) => value === "" || z.url().safeParse(value).success,
    "Please enter a valid thumbnail URL"
  ),
  category: z.string().trim().min(1, "Category is required"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.coerce.number().int().positive("Duration must be greater than 0"),
  status: z.enum(["draft", "published"]),
  instructorId: z.coerce.number().int().positive("Please select an instructor"),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface Course {
  id: number;
  courseTitle: string;
  courseCode: string;
  description: string | null;
  thumbnail: string | null;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number;
  status: "draft" | "published";
  instructorId?: number;
  instructor?: {
    id: number;
    fullName: string;
    email: string;
  };
}

interface Instructor {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

function AdminEditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
  } = useQuery<Course[]>({
    queryKey: ["admin-all-courses"],
    queryFn: async () => {
      const response = await api.get("/courses");
      return response.data.data;
    },
    enabled: Number.isInteger(courseId) && courseId > 0,
  });

  const course = courses.find((item) => item.id === courseId);

  const {
    data: instructors = [],
    isLoading: instructorsLoading,
    isError: instructorsError,
  } = useQuery<Instructor[]>({
    queryKey: ["admin-active-instructors"],
    queryFn: async () => {
      const response = await api.get("/users", {
        params: { role: "instructor", status: "active" },
      });

      const payload = response.data?.data;
      const users = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.users)
          ? payload.users
          : [];

      return users.filter(
        (user: Instructor) =>
          user.role?.toLowerCase() === "instructor" &&
          user.status?.toLowerCase() === "active"
      );
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.input<typeof courseSchema>,
    any,
    CourseFormValues
  >({
    resolver: zodResolver(courseSchema),
    values: course
      ? {
          courseTitle: course.courseTitle,
          courseCode: course.courseCode,
          description: course.description || "",
          thumbnail: course.thumbnail || "",
          category: course.category,
          level: course.level,
          duration: course.duration,
          status: course.status,
          instructorId: course.instructorId ?? course.instructor?.id ?? 0,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      const response = await api.put(`/courses/${courseId}`, {
        ...values,
        duration: Number(values.duration),
        instructorId: Number(values.instructorId),
        thumbnail: values.thumbnail || null,
      });

      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-all-courses"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
      ]);

      navigate("/admin/courses");
    },
  });

  const inputClass =
    "mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const errorClass = "mt-1 text-sm text-red-600";

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        Invalid course ID.
      </div>
    );
  }

  if (coursesLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        Unable to load course details. Please try again.
      </div>
    );
  }

  if (!course) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">Course not found</h2>
        <button
          type="button"
          onClick={() => navigate("/admin/courses")}
          className="mt-4 text-sm font-medium text-emerald-800"
        >
          Back to All Courses
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("/admin/courses")}
        className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to All Courses
      </button>

      <div>
        <p className="text-sm font-medium text-emerald-700">Administration</p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
          Edit Course
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Update course details and instructor assignment.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
        className="space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <div>
          <label className="text-sm font-medium text-stone-700">
            Course Title *
          </label>
          <input
            {...register("courseTitle")}
            maxLength={150}
            className={inputClass}
          />
          {errors.courseTitle && (
            <p className={errorClass}>{errors.courseTitle.message}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-stone-700">
              Course Code *
            </label>
            <input {...register("courseCode")} className={inputClass} />
            {errors.courseCode && (
              <p className={errorClass}>{errors.courseCode.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700">
              Category *
            </label>
            <input {...register("category")} className={inputClass} />
            {errors.category && (
              <p className={errorClass}>{errors.category.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">
            Thumbnail URL
          </label>
          <input
            {...register("thumbnail")}
            type="url"
            className={inputClass}
          />
          {errors.thumbnail && (
            <p className={errorClass}>{errors.thumbnail.message}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
            <GraduationCap className="h-4 w-4 text-emerald-700" />
            Assign Instructor *
          </label>
          <select
            {...register("instructorId")}
            className={inputClass}
            disabled={instructorsLoading || instructors.length === 0}
          >
            <option value={0}>Select an instructor</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.fullName} ({instructor.email})
              </option>
            ))}
          </select>
          {errors.instructorId && (
            <p className={errorClass}>{errors.instructorId.message}</p>
          )}
          {instructorsError && (
            <p className={errorClass}>Unable to load instructors.</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-stone-700">
              Level *
            </label>
            <select {...register("level")} className={inputClass}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700">
              Duration (Hours) *
            </label>
            <input
              {...register("duration")}
              type="number"
              min="1"
              className={inputClass}
            />
            {errors.duration && (
              <p className={errorClass}>{errors.duration.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700">
              Status *
            </label>
            <select {...register("status")} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {updateMutation.isError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {(
              updateMutation.error as {
                response?: { data?: { message?: string } };
              }
            )?.response?.data?.message ||
              "Course update failed. Please try again."}
          </p>
        )}

        <div className="flex justify-end border-t border-stone-100 pt-5">
          <button
            type="submit"
            disabled={
              updateMutation.isPending ||
              instructorsLoading ||
              instructors.length === 0
            }
            className="flex items-center gap-2 rounded-lg bg-emerald-800 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {updateMutation.isPending ? "Updating..." : "Update Course"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminEditCoursePage;
