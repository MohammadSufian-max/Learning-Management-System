
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { UserFormData } from "./UsersPage";

interface User {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: "admin" | "instructor" | "student";
  status: "active" | "inactive";
  profileImage: string | null;
}

interface UserFormProps {
  user: User | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
}

function UserForm({
  user,
  isSaving,
  onClose,
  onSubmit,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
      role: "student",
    },
  });

  useEffect(() => {
    reset({
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      mobileNumber: user?.mobileNumber ?? "",
      password: "",
      role: user?.role ?? "student",
      profileImage: user?.profileImage ?? null,
    });
  }, [user, reset]);

  const submitForm = (data: UserFormData) => {
    const payload = { ...data };

    if (!payload.password) {
      delete payload.password;
    }

    onSubmit(payload);
  };

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {user ? "Edit User" : "Create User"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {user
                ? "Update user information."
                : "Enter details to create a new user."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Full Name *
            </label>
            <input
              {...register("fullName", {
                required: "Full name is required",
                maxLength: {
                  value: 150,
                  message: "Maximum 150 characters",
                },
              })}
              className={inputClass}
              placeholder="Enter full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Email *
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
              className={inputClass}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Mobile Number *
            </label>
            <input
              {...register("mobileNumber", {
                required: "Mobile number is required",
                maxLength: {
                  value: 20,
                  message: "Maximum 20 characters",
                },
              })}
              className={inputClass}
              placeholder="Enter mobile number"
            />
            {errors.mobileNumber && (
              <p className="mt-1 text-xs text-red-600">
                {errors.mobileNumber.message}
              </p>
            )}
          </div>

          {!user && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                Password *
              </label>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                className={inputClass}
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700">
              Role *
            </label>
            <select
              {...register("role", { required: "Role is required" })}
              className={inputClass}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : user
                  ? "Update User"
                  : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;
