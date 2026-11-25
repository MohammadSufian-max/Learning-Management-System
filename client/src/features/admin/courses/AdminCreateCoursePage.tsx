
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Save,
  GraduationCap,
} from "lucide-react";
import api from "../../../api/axios";

// -------------------- Zod Schema --------------------

const courseSchema = z.object({
  courseTitle: z
    .string()
    .trim()
    .min(1, "Course title is required")
    .max(150, "Course title cannot exceed 150 characters"),

  courseCode: z.string().trim().min(1, "Course code is required"),

  description: z.string().optional(),

  thumbnail: z.string().trim().refine(
    (value) => value === "" || z.url().safeParse(value).success,
    "Please enter a valid thumbnail URL"
  ),

  category: z.string().trim().min(1, "Category is required"),

  level: z.enum(["beginner", "intermediate", "advanced"]),

  duration: z.coerce
    .number()
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0"),

  status: z.enum(["draft", "published"]),

  instructorId: z.coerce
    .number()
    .int()
    .positive("Please select an instructor"),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface Instructor {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

// -------------------- Component --------------------

function AdminCreateCoursePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch active instructors
  const {
    data: instructors = [],
    isLoading: instructorsLoading,
    isError: instructorsError,
  } = useQuery<Instructor[]>({
    queryKey: ["admin-active-instructors"],
    queryFn: async () => {
      const response = await api.get("/users", {
        params: {
          role: "instructor",
          status: "active",
        },
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
    defaultValues: {
      courseTitle: "",
      courseCode: "",
      description: "",
      thumbnail: "",
      category: "",
      level: "beginner",
      duration: 1,
      status: "draft",
      instructorId: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      const response = await api.post("/courses", {
        ...values,
        duration: Number(values.duration),
        instructorId: Number(values.instructorId),
        thumbnail: values.thumbnail || null,
      });

      return response.data;
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-all-courses"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-dashboard"],
        }),
      ]);

      navigate("/admin/courses");
    },
  });

  const onSubmit = (values: CourseFormValues) => {
    createMutation.mutate(values);
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const errorClass = "mt-1 text-sm text-red-600";

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
        <p className="text-sm font-medium text-emerald-700">
          Administration
        </p>

        <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
          Create Course
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Create a course and assign it to an instructor.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8"
      >
        {/* Course Title */}

        <div>
          <label className="text-sm font-medium text-stone-700">
            Course Title *
          </label>

          <input
            {...register("courseTitle")}
            maxLength={150}
            placeholder="Enter course title"
            className={inputClass}
          />

          {errors.courseTitle && (
            <p className={errorClass}>{errors.courseTitle.message}</p>
          )}
        </div>

        {/* Course Code and Category */}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-stone-700">
              Course Code *
            </label>

            <input
              {...register("courseCode")}
              placeholder="e.g. REACT101"
              className={inputClass}
            />

            {errors.courseCode && (
              <p className={errorClass}>{errors.courseCode.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700">
              Category *
            </label>

            <input
              {...register("category")}
              placeholder="e.g. Web Development"
              className={inputClass}
            />

            {errors.category && (
              <p className={errorClass}>{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Description */}

        <div>
          <label className="text-sm font-medium text-stone-700">
            Description
          </label>

          <textarea
            {...register("description")}
            rows={4}
            placeholder="Describe what students will learn..."
            className={inputClass}
          />
        </div>

        {/* Thumbnail */}

        <div>
          <label className="text-sm font-medium text-stone-700">
            Thumbnail URL
          </label>

          <input
            {...register("thumbnail")}
            type="url"
            placeholder="https://example.com/course-image.jpg"
            className={inputClass}
          />

          {errors.thumbnail && (
            <p className={errorClass}>{errors.thumbnail.message}</p>
          )}
        </div>

        {/* Instructor */}

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
            <option value={0}>
              {instructorsLoading
                ? "Loading instructors..."
                : "Select an instructor"}
            </option>

            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.fullName} ({instructor.email})
              </option>
            ))}
          </select>

          {errors.instructorId && (
            <p className={errorClass}>
              {errors.instructorId.message}
            </p>
          )}

          {instructorsError && (
            <p className={errorClass}>
              Unable to load instructors. Please refresh the page.
            </p>
          )}

          {!instructorsLoading &&
            !instructorsError &&
            instructors.length === 0 && (
              <p className={errorClass}>
                No active instructors found. Please add or activate an instructor first.
              </p>
            )}
        </div>

        {/* Level, Duration and Status */}

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
              placeholder="e.g. 20"
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

        {/* API Error */}

        {createMutation.isError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {(
              createMutation.error as {
                response?: { data?: { message?: string } };
              }
            )?.response?.data?.message ||
              "Course creation failed. Please try again."}
          </p>
        )}

        {/* Submit */}

        <div className="flex justify-end border-t border-stone-100 pt-5">
          <button
            type="submit"
            disabled={
              createMutation.isPending ||
              instructorsLoading ||
              instructors.length === 0
            }
            className="flex items-center gap-2 rounded-lg bg-emerald-800 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {createMutation.isPending ? "Creating..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminCreateCoursePage;
