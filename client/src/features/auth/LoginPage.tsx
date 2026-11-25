
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, Loader2, Lock, Mail } from "lucide-react";

import { loginUser } from "./authApi";
import { useAuthStore } from "../../store/authStore";

function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => loginUser(email.trim(), password),
    onSuccess: (response) => {
      const { accessToken, user } = response.data;

      setAuth(user, accessToken);

      const dashboardRoutes = {
        admin: "/admin/dashboard",
        instructor: "/instructor/dashboard",
        student: "/student/dashboard",
      };

      navigate(dashboardRoutes[user.role], { replace: true });
    },
    onError: (error: any) => {
      setErrorMessage(
        error.response?.data?.message || "Unable to login. Please try again."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    loginMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f5] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg md:grid-cols-2">
        
        <div className="flex flex-col justify-between bg-emerald-900 p-8 text-white md:p-12">
          <div className="flex items-center gap-3">
            <GraduationCap size={38} />
            <span className="text-2xl font-bold">LMS</span>
          </div>

          <div className="my-12">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Learning Management System
            </p>

            <h1 className="text-4xl font-bold leading-tight">
              Learn. Grow.
              <br />
              Achieve More.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-emerald-100">
              Access your courses, learning materials, assessments and
              academic progress from one place.
            </p>
          </div>

          <p className="text-sm text-emerald-200">
            Your learning journey starts here.
          </p>
        </div>

        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <div className="flex items-center rounded-xl border border-stone-300 px-4 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-100">
                <Mail size={18} className="text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full bg-transparent px-3 py-3.5 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="flex items-center rounded-xl border border-stone-300 px-4 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-100">
                <Lock size={18} className="text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-transparent px-3 py-3.5 text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-emerald-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3.5 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending && (
                <Loader2 size={19} className="animate-spin" />
              )}
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Learning Management System
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
