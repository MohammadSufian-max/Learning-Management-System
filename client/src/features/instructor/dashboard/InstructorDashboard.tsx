
import {
  BookOpen,
  PlusCircle,
  Layers,
  ClipboardList,
  Users,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";

const dashboardSections = [
  {
    title: "My Courses",
    description: "View and manage your courses.",
    path: "/instructor/courses",
    icon: BookOpen,
  },
  {
    title: "Create Course",
    description: "Create a new course for students.",
    path: "/instructor/courses/create",
    icon: PlusCircle,
  },
  {
    title: "Modules & Lessons",
    description: "Organize course modules and lessons.",
    path: "/instructor/modules",
    icon: Layers,
  },
  {
    title: "Quizzes & Questions",
    description: "Manage quizzes and their questions.",
    path: "/instructor/quizzes",
    icon: ClipboardList,
  },
  {
    title: "Student Results",
    description: "View student assessment results.",
    path: "/instructor/results",
    icon: Users,
  },
];

function InstructorDashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-emerald-700">
          Instructor Workspace
        </p>

        <h1 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">
          Welcome back, {user?.fullName || "Instructor"}!
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Manage your courses, learning content and student assessments.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          Manage Your Workspace
        </h2>

        <p className="mt-1 text-sm text-stone-500">
          Choose a section to continue your work.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardSections.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 font-semibold text-stone-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  {item.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  Open Section
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default InstructorDashboard;
