
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Pencil, UserX, UserCheck, RefreshCw } from "lucide-react";
import api from "../../../api/axios";
import UserForm from "./UserForm";

interface User {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: "admin" | "instructor" | "student";
  status: "active" | "inactive";
  profileImage: string | null;
  createdAt: string;
}

export type UserFormData = {
  fullName: string;
  email: string;
  mobileNumber: string;
  password?: string;
  role: "admin" | "instructor" | "student";
  profileImage?: string | null;
};

function UsersPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users = [], isLoading, isError, refetch } = useQuery<User[]>({
    queryKey: ["admin-users", search, role, status],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (role !== "all") params.role = role;
      if (status !== "all") params.status = status;

      const response = await api.get("/users", { params });
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      await api.post("/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      if (!editingUser) return;
      await api.put(`/users/${editingUser.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowForm(false);
      setEditingUser(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/users/${id}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const activateMutation = useMutation({
  mutationFn: (id: number) => api.patch(`/users/${id}/activate`),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  },
});

  const handleSubmit = (data: UserFormData) => {
    if (editingUser) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleDeactivate = (user: User) => {
    if (
      window.confirm(
        `Are you sure you want to deactivate ${user.fullName}?`
      )
    ) {
      deactivateMutation.mutate(user.id);
    }
  };

  const mutationError =
    createMutation.error || updateMutation.error || deactivateMutation.error;

  const getErrorMessage = (error: unknown) => {
    if (error && typeof error === "object" && "response" in error) {
      const response = (error as {
        response?: { data?: { message?: string } };
      }).response;
      return response?.data?.message || "Something went wrong.";
    }
    return error instanceof Error ? error.message : "Something went wrong.";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage administrators, instructors and students.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {users.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active Users</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {users.filter((user) => user.status === "active").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Inactive Users</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {users.filter((user) => user.status === "inactive").length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-600"
            />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="instructor">Instructor</option>
            <option value="student">Student</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => refetch()}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-slate-600 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {mutationError && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {getErrorMessage(mutationError)}
          </p>
        )}

        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-500">
            Loading users...
          </p>
        ) : isError ? (
          <div className="py-10 text-center">
            <p className="text-sm text-red-600">Failed to load users.</p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-sm text-emerald-700"
            >
              Try again
            </button>
          </div>
        ) : users.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            No users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">
                        {user.fullName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {user.mobileNumber}
                    </td>
                    <td className="px-4 py-4">
                      <span className="capitalize text-sm text-slate-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          title="Edit user"
                        >
                          <Pencil size={17} />
                        </button>
                        {user.status === "active" && (
                          <button
                            onClick={() => handleDeactivate(user)}
                            disabled={deactivateMutation.isPending}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Deactivate user"
                          >
                            <UserX size={17} />
                          </button>
                        )}
                        {user.status === "inactive" && (
  <button
    onClick={() => activateMutation.mutate(user.id)}
    disabled={activateMutation.isPending}
    className="text-green-600 hover:text-green-700"
    title="Activate User"
  >
    <UserCheck size={18} />
  </button>
)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <UserForm
          user={editingUser}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default UsersPage;
