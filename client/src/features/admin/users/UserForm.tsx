
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { UserFormData } from "./UsersPage";
import api from "../../../api/axios";

interface AssignedRole {
  id: number;
  name: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: "admin" | "instructor" | "student";
  status: "active" | "inactive";
  profileImage: string | null;
  roles?: AssignedRole[];
}

interface Role {
  id: number;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: { id: number; name: string }[];
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
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
      role: "student",
      roleIds: [],
    },
  });

  const primaryRole = watch("role");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        setRolesError("");

        const response = await api.get("/roles");
        const data =
          response.data?.roles ??
          response.data?.data?.roles ??
          response.data?.data ??
          response.data;

        if (!Array.isArray(data)) {
          throw new Error("Invalid roles response");
        }

        setAvailableRoles(data);
      } catch (error: any) {
        setRolesError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load roles."
        );
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    reset({
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      mobileNumber: user?.mobileNumber ?? "",
      password: "",
      role: user?.role ?? "student",
      profileImage: user?.profileImage ?? null,
      roleIds: user?.roles?.map((role) => role.id) ?? [],
    });
  }, [user, reset]);

  useEffect(() => {
    if (rolesLoading || availableRoles.length === 0) return;

    const primarySystemRole = availableRoles.find(
      (role) => role.isSystem && role.name === primaryRole
    );

    if (user) {
      const existingRoleIds =
        user.roles?.map((role) => role.id) ?? [];

      if (user.roles) {
        setSelectedRoleIds(existingRoleIds);
      } else {
        setSelectedRoleIds(
          primarySystemRole ? [primarySystemRole.id] : []
        );
      }
    } else {
      setSelectedRoleIds(
        primarySystemRole ? [primarySystemRole.id] : []
      );
    }
  }, [user, availableRoles, rolesLoading, primaryRole]);

  const toggleRole = (roleId: number) => {
    const selectedRole = availableRoles.find(
      (role) => role.id === roleId
    );

    if (selectedRole?.isSystem && selectedRole.name === primaryRole) {
      return;
    }

    setSelectedRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId]
    );
  };

  const submitForm = (data: UserFormData) => {
    const payload = { ...data };

    if (!payload.password) {
      delete payload.password;
    }

    const primarySystemRole = availableRoles.find(
      (role) => role.isSystem && role.name === data.role
    );

    const roleIds = [...selectedRoleIds];

    if (primarySystemRole && !roleIds.includes(primarySystemRole.id)) {
      roleIds.push(primarySystemRole.id);
    }

    payload.roleIds = roleIds;

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
                ? "Update user information and assigned roles."
                : "Enter details to create a new user."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit(submitForm)}
          className="space-y-4"
        >
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
              Primary Role *
            </label>
            <select
              {...register("role", { required: "Role is required" })}
              className={inputClass}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              The primary system role is always assigned to the user.
            </p>
          </div>

          <div>
            <div className="mb-2">
              <label className="text-sm font-semibold text-slate-700">
                Additional Roles
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Select other system or custom roles for this user.
              </p>
            </div>

            {rolesLoading ? (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                Loading available roles...
              </p>
            ) : rolesError ? (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {rolesError}
              </p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
                {availableRoles.map((role) => {
                  const isPrimary =
                    role.isSystem && role.name === primaryRole;

                  return (
                    <label
                      key={role.id}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium capitalize text-slate-800">
                          {role.name.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-slate-500">
                          {role.isSystem ? "System Role" : "Custom Role"}
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={selectedRoleIds.includes(role.id)}
                        disabled={isPrimary}
                        onChange={() => toggleRole(role.id)}
                        className="h-4 w-4 accent-emerald-700 disabled:cursor-not-allowed"
                      />
                    </label>
                  );
                })}
              </div>
            )}

            <p className="mt-2 text-xs text-slate-500">
              {selectedRoleIds.length} roles selected, including the primary role.
            </p>
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
              disabled={isSaving || rolesLoading || !!rolesError}
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
