import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserCircle, Mail, Phone, ShieldCheck, Save, X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  changeMyPassword,
  type ChangePasswordData,
} from "./profileService";

import {
  getMyProfile,
  updateMyProfile,
  type UpdateProfileData,
} from "./profileService";

function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileData>();

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["myProfile"], updatedProfile);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully.");
      reset({
        fullName: updatedProfile.fullName,
        mobileNumber: updatedProfile.mobileNumber,
      });
    },
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const [passwordMessage, setPasswordMessage] = useState("");
const [passwordError, setPasswordError] = useState("");

const passwordForm = useForm<ChangePasswordData>({
  defaultValues: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  },
});

const passwordMutation = useMutation({
  mutationFn: changeMyPassword,

  onSuccess: (response) => {
    setPasswordMessage(
      response.message || "Password changed successfully."
    );
    setPasswordError("");
    passwordForm.reset();
  },

  onError: (error: any) => {
    setPasswordError(
      error.response?.data?.message ||
      "Failed to change password."
    );
    setPasswordMessage("");
  },
});

const onPasswordSubmit = (data: ChangePasswordData) => {
  setPasswordMessage("");
  setPasswordError("");
  passwordMutation.mutate(data);
};

  const startEditing = () => {
    if (!profile) return;

    reset({
      fullName: profile.fullName,
      mobileNumber: profile.mobileNumber,
    });

    setSuccessMessage("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    reset({
      fullName: profile?.fullName ?? "",
      mobileNumber: profile?.mobileNumber ?? "",
    });
    setIsEditing(false);
  };

  const onSubmit = (data: UpdateProfileData) => {
    setSuccessMessage("");
    updateMutation.mutate(data);
  };

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600";

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        Failed to load profile. Please refresh the page and try again.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage your personal account information.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {updateMutation.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {updateMutation.error instanceof Error
            ? updateMutation.error.message
            : "Failed to update profile."}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="bg-emerald-800 px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white/30 bg-white text-emerald-800">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle className="h-14 w-14" />
              )}
            </div>

            <div className="text-center text-white sm:text-left">
              <h2 className="text-xl font-bold">{profile.fullName}</h2>
              <p className="mt-1 text-sm capitalize text-emerald-100">
                {profile.role.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Personal Information
            </h3>

            {!isEditing && (
              <button
                type="button"
                onClick={startEditing}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <UserCircle className="h-4 w-4 text-slate-400" />
                Full Name
              </label>

              {isEditing ? (
                <>
                  <input
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: {
                        value: 3,
                        message: "Name must be at least 3 characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Maximum 100 characters",
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
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-900">
                  {profile.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Mail className="h-4 w-4 text-slate-400" />
                Email Address
              </label>
              <p className="mt-2 text-sm text-slate-500">{profile.email}</p>
              <p className="mt-1 text-xs text-slate-400">
                Email address cannot be changed.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Phone className="h-4 w-4 text-slate-400" />
                Mobile Number
              </label>

              {isEditing ? (
                <>
                  <div className="mt-1.5 flex overflow-hidden rounded-lg border border-slate-200 focus-within:border-emerald-600">
                    <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      {...register("mobileNumber", {
                        required: "Mobile number is required",
                        pattern: {
                          value: /^[6-9][0-9]{9}$/,
                          message: "Enter a valid 10-digit Indian mobile number",
                        },
                        onChange: (event) => {
                          event.target.value = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                        },
                      })}
                      className="w-full px-3 py-2.5 text-sm outline-none"
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.mobileNumber.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-900">
                  +91 {profile.mobileNumber}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                Account Role
              </label>
              <p className="mt-2 text-sm capitalize text-slate-900">
                {profile.role.replace(/_/g, " ")}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Account Status
              </label>
              <p className="mt-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    profile.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {profile.status}
                </span>
              </p>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Security Section */}
<div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">

  <div className="border-b border-stone-100 p-6">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
        <LockKeyhole className="h-5 w-5" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Security
        </h3>
        <p className="text-sm text-slate-500">
          Update your account password.
        </p>
      </div>
    </div>
  </div>

  <form
    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
    className="space-y-5 p-6"
  >
    {passwordMessage && (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
        {passwordMessage}
      </div>
    )}

    {passwordError && (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
        {passwordError}
      </div>
    )}

    {/* Current Password */}
    <div>
      <label className="text-sm font-medium text-slate-700">
        Current Password
      </label>

      <div className="relative">
        <input
          type={showCurrentPassword ? "text" : "password"}
          {...passwordForm.register("currentPassword", {
            required: "Current password is required",
          })}
          className={`${inputClass} pr-12`}
          placeholder="Enter current password"
        />

        <button
          type="button"
          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          className="absolute right-3 top-4 text-slate-500"
        >
          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {passwordForm.formState.errors.currentPassword && (
        <p className="mt-1 text-xs text-red-600">
          {passwordForm.formState.errors.currentPassword.message}
        </p>
      )}
    </div>

    {/* New Password */}
    <div>
      <label className="text-sm font-medium text-slate-700">
        New Password
      </label>

      <div className="relative">
        <input
          type={showNewPassword ? "text" : "password"}
          {...passwordForm.register("newPassword", {
            required: "New password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
          className={`${inputClass} pr-12`}
          placeholder="Enter new password"
        />

        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute right-3 top-4 text-slate-500"
        >
          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {passwordForm.formState.errors.newPassword && (
        <p className="mt-1 text-xs text-red-600">
          {passwordForm.formState.errors.newPassword.message}
        </p>
      )}
    </div>

    {/* Confirm Password */}
    <div>
      <label className="text-sm font-medium text-slate-700">
        Confirm New Password
      </label>

      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          {...passwordForm.register("confirmPassword", {
            required: "Please confirm your new password",
            validate: (value) =>
              value === passwordForm.getValues("newPassword") ||
              "Passwords do not match",
          })}
          className={`${inputClass} pr-12`}
          placeholder="Confirm new password"
        />

        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-4 text-slate-500"
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {passwordForm.formState.errors.confirmPassword && (
        <p className="mt-1 text-xs text-red-600">
          {passwordForm.formState.errors.confirmPassword.message}
        </p>
      )}
    </div>

    <div className="flex justify-end border-t border-slate-100 pt-5">
      <button
        type="submit"
        disabled={passwordMutation.isPending}
        className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {passwordMutation.isPending
          ? "Updating..."
          : "Change Password"}
      </button>
    </div>
  </form>
</div>
    </div>
  );
}

export default ProfilePage;