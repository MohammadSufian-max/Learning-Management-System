import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  Compass,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Trophy,
  Bell,
  LogOut,
  UserCircle,
  Menu,
  X,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";

const navigation = [
  { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { label: "Browse Courses", path: "/student/courses", icon: Compass },
  { label: "My Courses", path: "/student/my-courses", icon: BookOpen },
  {
    label: "Learning Progress",
    path: "/student/progress",
    icon: ChartNoAxesColumnIncreasing,
  },
  { label: "My Quizzes", path: "/student/quizzes", icon: ClipboardList },
  { label: "Quiz Results", path: "/student/results", icon: Trophy },
];

function StudentLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] text-slate-900">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-[72px] items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            className="rounded-lg p-2 text-slate-600 hover:bg-emerald-50 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <GraduationCap size={34} className="text-emerald-800" />
          <span className="text-xl font-bold sm:text-2xl">LMS</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            aria-label="Notifications"
            className="text-slate-500 transition hover:text-emerald-800"
          >
            <Bell size={21} />
          </button>

          <NavLink
            to="/student/profile"
            className="hidden items-center gap-3 rounded-lg p-1 transition hover:bg-emerald-50 sm:flex"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-white">
              <UserCircle size={22} />
            </div>

            <div className="max-w-[150px]">
              <p className="truncate text-sm font-semibold">
                {user?.fullName || "Student"}
              </p>
              <p className="text-xs capitalize text-slate-500">
                {user?.role || "Student"}
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-[72px] z-50 w-[280px] border-r border-stone-200 bg-white px-4 py-6 transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Student Menu
          </p>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/student/dashboard"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-800 text-white"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                  }`
                }
              >
                <Icon size={19} className="shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed bottom-0 left-0 top-[72px] z-20 hidden w-[260px] border-r border-stone-200 bg-white px-4 py-7 md:block">
        <p className="mb-5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Student Menu
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/student/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-800 text-white"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                  }`
                }
              >
                <Icon size={19} className="shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen min-w-0 px-4 pb-8 pt-[96px] sm:px-6 md:ml-[260px] md:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentLayout;
