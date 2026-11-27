
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  Search,
  X,
  Loader2,
} from "lucide-react";
import api from "../../../api/axios";

interface Permission {
  id: number;
  name: string;
  module: string;
  description?: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
}

const getErrorMessage = (error: any) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

function getResponseData(response: any, key: string) {
  const data = response.data;
  return data?.[key] ?? data?.data?.[key] ?? data?.data ?? data;
}

function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [rolesResponse, permissionsResponse] = await Promise.all([
        api.get("/roles"),
        api.get("/roles/permissions"),
      ]);

      const rolesData = getResponseData(rolesResponse, "roles");
      const permissionsData = getResponseData(
        permissionsResponse,
        "permissions"
      );

      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(
        Array.isArray(permissionsData) ? permissionsData : []
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, Permission[]>>(
      (groups, permission) => {
        const module = permission.module || "Other";
        if (!groups[module]) groups[module] = [];
        groups[module].push(permission);
        return groups;
      },
      {}
    );
  }, [permissions]);

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingRole(null);
    setName("");
    setDescription("");
    setSelectedPermissions([]);
    setModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || "");
    setSelectedPermissions(role.permissions.map((permission) => permission.id));
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingRole(null);
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId]
    );
  };

  const toggleModule = (modulePermissions: Permission[]) => {
    const ids = modulePermissions.map((permission) => permission.id);
    const allSelected = ids.every((id) =>
      selectedPermissions.includes(id)
    );

    setSelectedPermissions((current) =>
      allSelected
        ? current.filter((id) => !ids.includes(id))
        : [...new Set([...current, ...ids])]
    );
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: name.trim(),
        description: description.trim(),
        permissionIds: selectedPermissions,
      };

      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, payload);
      } else {
        await api.post("/roles", payload);
      }

      setModalOpen(false);
      setEditingRole(null);
      await fetchData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${role.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/roles/${role.id}`);
      await fetchData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Roles & Permissions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create roles and manage their access permissions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search roles..."
          className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-700"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredRoles.map((role) => (
          <div
            key={role.id}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <ShieldCheck className="h-6 w-6" />
              </div>

              {role.isSystem ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  System Role
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Custom Role
                </span>
              )}
            </div>

            <h3 className="mt-4 text-lg font-bold capitalize text-slate-900">
              {role.name.replace(/_/g, " ")}
            </h3>

            <p className="mt-1 min-h-10 text-sm text-slate-500">
              {role.description || "No description provided."}
            </p>

            <div className="mt-4 border-t border-stone-100 pt-4">
              <p className="text-sm font-semibold text-slate-800">
                {role.permissions?.length || 0} Permissions
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {role.permissions?.slice(0, 4).map((permission) => (
                  <span
                    key={permission.id}
                    className="rounded-md bg-stone-100 px-2 py-1 text-xs text-slate-600"
                  >
                    {permission.name}
                  </span>
                ))}

                {(role.permissions?.length || 0) > 4 && (
                  <span className="rounded-md bg-stone-100 px-2 py-1 text-xs text-slate-600">
                    +{role.permissions.length - 4} more
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => openEditModal(role)}
                disabled={role.isSystem}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>

              <button
                onClick={() => handleDelete(role)}
                disabled={role.isSystem}
                className="flex items-center justify-center rounded-lg border border-red-100 px-4 py-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Delete ${role.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white py-12 text-center text-sm text-slate-500">
          No roles found.
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingRole ? "Edit Role" : "Create Role"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configure role details and permissions.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 hover:bg-stone-100"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Role Name
                  </label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Content Manager"
                    required
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe this role..."
                    rows={2}
                    className="w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800">
                      Permissions
                    </h3>
                    <span className="text-xs text-slate-500">
                      {selectedPermissions.length} selected
                    </span>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(
                      ([module, modulePermissions]) => {
                        const allSelected = modulePermissions.every(
                          (permission) =>
                            selectedPermissions.includes(permission.id)
                        );

                        return (
                          <div
                            key={module}
                            className="rounded-xl border border-stone-200 p-4"
                          >
                            <label className="mb-3 flex cursor-pointer items-center justify-between border-b border-stone-100 pb-3">
                              <span className="font-semibold capitalize text-slate-800">
                                {module.replace(/_/g, " ")}
                              </span>
                              <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={() =>
                                  toggleModule(modulePermissions)
                                }
                                className="h-4 w-4 accent-emerald-800"
                              />
                            </label>

                            <div className="grid gap-3 sm:grid-cols-2">
                              {modulePermissions.map((permission) => (
                                <label
                                  key={permission.id}
                                  className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(
                                      permission.id
                                    )}
                                    onChange={() =>
                                      togglePermission(permission.id)
                                    }
                                    className="h-4 w-4 accent-emerald-800"
                                  />
                                  {permission.name}
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-stone-200 p-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-stone-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingRole ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesPage;
