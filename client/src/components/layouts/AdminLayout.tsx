
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap as EnrollmentIcon,
  ChartNoAxesCombined,
  LogOut,
  Bell,
  UserCircle,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const navigation = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "User Management", path: "/admin/users", icon: Users },
  {
  label: "Roles & Permissions",
  path: "/admin/roles",
  icon: ShieldCheck,
},
  { label: "All Courses", path: "/admin/courses", icon: BookOpen },
  { label: "Enrollments", path: "/admin/enrollments", icon: EnrollmentIcon },
  { label: "Reports / Activity", path: "/admin/reports", icon: ChartNoAxesCombined },
];

function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#faf9f5]">
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

          <GraduationCap className="h-8 w-8 text-emerald-800 sm:h-9 sm:w-9" />
          <span className="text-xl font-bold text-slate-900 sm:text-2xl">LMS</span>

          <span className="hidden rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800 sm:inline">
            ADMIN
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            aria-label="Notifications"
            className="text-slate-500 transition hover:text-emerald-700"
          >
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-white">
              <UserCircle className="h-6 w-6" />
            </div>

            <div className="max-w-[150px]">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.fullName || "Administrator"}
              </p>
              <p className="flex items-center gap-1 text-xs capitalize text-slate-500">
                <ShieldCheck className="h-3 w-3" />
                {user?.role || "Admin"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
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

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-[72px] z-50 w-[280px] border-r border-stone-200 bg-white px-4 py-6 transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Administration
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
                end={item.path === "/admin/dashboard"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-800 text-white"
                      : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed bottom-0 left-0 top-[72px] z-20 hidden w-[260px] border-r border-stone-200 bg-white px-4 py-6 md:block">
        <div className="mb-5 px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Administration
          </p>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-800 text-white"
                      : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
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

export default AdminLayout;
