import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../features/auth/LoginPage";
import StudentDashboard from "../features/student/dashboard/StudentDashboard";
import ProtectedRoute from "../components/common/ProtectedRoute";
import StudentLayout from "../components/layouts/StudentLayout";
import { useAuthStore } from "../store/authStore";
import BrowseCoursesPage from "../features/student/courses/BrowseCoursesPage";
import MyCoursesPage from "../features/student/courses/MyCoursesPage";
import LearningProgressPage from "../features/student/progress/LearningProgressPage";
import MyQuizzesPage from "../features/student/quizzes/MyQuizzesPage";
import QuizAttemptPage from "../features/student/quizzes/QuizAttemptPage";
import QuizResultsPage from "../features/student/quizzes/QuizResultsPage";
import InstructorLayout from "../components/layouts/InstructorLayout";
import InstructorDashboard from "../features/instructor/dashboard/InstructorDashboard";
import InstructorMyCoursesPage from "../features/instructor/courses/MyCoursesPage";
import CreateCoursePage from "../features/instructor/courses/CreateCoursePage";
import ModulesPage from "../features/instructor/modules/ModulesPage";
import QuizzesPage from "../features/instructor/quizzes/QuizzesPage";
import QuestionsPage from "../features/instructor/questions/QuestionsPage";
import InstructorResultsPage from "../features/instructor/results/InstructorResultsPage";
import UsersPage from "../features/admin/users/UsersPage";
import AdminDashboard from "../features/admin/dashboard/AdminDashboard";
import AdminLayout from "../components/layouts/AdminLayout";
import AllCoursesPage from "../features/admin/courses/AllCoursesPage";
import AdminCreateCoursePage from "../features/admin/courses/AdminCreateCoursePage";
import AdminEditCoursePage from "../features/admin/courses/AdminEditCoursePage";
import AdminEnrollmentsPage from "../features/admin/enrollments/AdminEnrollmentsPage";
import AdminReportsPage from "../features/admin/reports/AdminReportsPage";
import RolesPage from "../features/admin/roles/RolesPage";

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f5]">
      <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-emerald-900">
          403 - Unauthorized
        </h1>
        <p className="mt-3 text-slate-500">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const dashboardRoutes = {
    admin: "/admin/dashboard",
    instructor: "/instructor/dashboard",
    student: "/student/dashboard",
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={
                isAuthenticated && user ? dashboardRoutes[user.role] : "/login"
              }
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            isAuthenticated && user ? (
              <Navigate to={dashboardRoutes[user.role]} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="courses" element={<AllCoursesPage />} />
            <Route path="courses/create" element={<AdminCreateCoursePage />} />
            <Route path="courses/edit/:id" element={<AdminEditCoursePage />} />
            <Route path="enrollments" element={<AdminEnrollmentsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="roles" element={<RolesPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="courses" element={<InstructorMyCoursesPage />} />
            <Route path="courses/create" element={<CreateCoursePage />} />
            <Route path="modules" element={<ModulesPage />} />
            <Route path="quizzes" element={<QuizzesPage />} />

            <Route path="questions" element={<QuestionsPage />} />
            <Route path="results" element={<InstructorResultsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<BrowseCoursesPage />} />
            <Route path="my-courses" element={<MyCoursesPage />} />
            <Route path="progress" element={<LearningProgressPage />} />
            <Route path="quizzes" element={<MyQuizzesPage />} />
            <Route path="results" element={<QuizResultsPage />} />

            <Route path="quiz/:quizId" element={<QuizAttemptPage />} />
          </Route>
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
