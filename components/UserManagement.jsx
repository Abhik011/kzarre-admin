"use client";

import React, { useEffect, useState } from "react";
import { Plus, X, Shield } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

const API_BASE = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}`;

/* ===================================================
   DATA HOOKS
=================================================== */
const useRoles = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const token =
      localStorage.getItem("superadmin_token") ||
      localStorage.getItem("admin_token");

    if (!token) return;

    fetch(`${API_BASE}/api/usersadmin/roles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => setRoles(data.roles || []))
      .catch(err => console.error("Roles error:", err.message));
  }, []);

  return roles;
};


const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const token =
      localStorage.getItem("superadmin_token") ||
      localStorage.getItem("admin_token");

    fetch(`${API_BASE}/api/usersadmin/permissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => setPermissions(data.permissions || []))
      .catch(err => console.error("Permissions error:", err));
  }, []);

  return permissions;
};


/* ===================================================
   USER LIST
=================================================== */
const UserList = ({ refreshKey, onEditPermissions }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token =
      localStorage.getItem("superadmin_token") ||
      localStorage.getItem("admin_token");

    fetch(`${API_BASE}/api/usersadmin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []));
  }, [refreshKey]);

  return (
    <div className="bg-[var(--background-card)] border border-[var(--borderColor)] rounded-2xl p-6">
      <h3 className="text-lg font-bold text-[var(--textPrimary)] mb-4">
        User List
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--borderColor)]">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-[var(--borderColor)]">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.roleGroup?.name || "—"}</td>
                <td className="px-4 py-3">
                  {u.isActive ? "Active" : "Inactive"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onEditPermissions(u)}
                    className="text-green-500 text-xs flex items-center gap-1"
                  >
                    <Shield size={14} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ===================================================
   EDIT PERMISSIONS MODAL
=================================================== */
const EditPermissionsModal = ({ user, onClose }) => {
  const permissions = usePermissions();
  const [selected, setSelected] = useState(user.permissions || []);

  const toggle = key =>
    setSelected(prev =>
      prev.includes(key)
        ? prev.filter(x => x !== key)
        : [...prev, key]
    );

  const save = async () => {
    const token =
      localStorage.getItem("superadmin_token") ||
      localStorage.getItem("admin_token");

    await fetch(
      `${API_BASE}/api/usersadmin/update-permissions/${user._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions: selected }),
      }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--background-card)] border border-[var(--borderColor)] rounded-xl w-full max-w-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-[var(--textPrimary)]">
          Edit Permissions – {user.name}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {permissions.map(p => (
            <label key={p.key} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(p.key)}
                onChange={() => toggle(p.key)}
                className="accent-green-500"
              />
              {p.label}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-[var(--borderColor)] rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 text-sm bg-[var(--accent-green)] rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===================================================
   CREATE ROLE MODAL
=================================================== */
const CreateRoleModal = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const permissions = usePermissions();

  const toggle = key =>
    setSelected(prev =>
      prev.includes(key)
        ? prev.filter(x => x !== key)
        : [...prev, key]
    );

  const create = async () => {
    if (!name.trim()) return alert("Role name required");

    try {
      setSaving(true);
      const token =
        localStorage.getItem("superadmin_token") ||
        localStorage.getItem("admin_token");

      const res = await fetch(`${API_BASE}/api/usersadmin/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, permissions: selected }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      onCreated?.();
      onClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--background-card)] border border-[var(--borderColor)] rounded-xl w-full max-w-xl p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-lg font-bold text-[var(--textPrimary)]">
            Create Role
          </h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <input
          placeholder="Role name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full mb-5 border border-[var(--borderColor)] bg-transparent rounded-lg px-3 py-2"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {permissions.map(p => (
            <label key={p.key} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(p.key)}
                onChange={() => toggle(p.key)}
                className="accent-green-500"
              />
              {p.label}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[var(--borderColor)] rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={create}
            disabled={saving}
            className="px-4 py-2 bg-[var(--accent-green)] rounded-lg"
          >
            {saving ? "Creating..." : "Create Role"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===================================================
   ROLES & PERMISSIONS
=================================================== */
const RolesPermissions = () => {
  const roles = useRoles();

  return (
    <div className="bg-[var(--background-card)] border border-[var(--borderColor)] rounded-2xl p-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--borderColor)]">
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-left">Permissions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(r => (
            <tr key={r._id} className="border-b border-[var(--borderColor)]">
              <td className="px-4 py-3 font-medium">{r.name}</td>
              <td className="px-4 py-3 text-xs">
                {r.permissions?.join(", ") || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ===================================================
   ACTIVITY LOG
=================================================== */
const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem("superadmin_token");

  useEffect(() => {
    fetch(`${API_BASE}/api/activity`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setLogs(data.logs || []));
  }, []);

  return (
    <div className="bg-[var(--background-card)] border border-[var(--borderColor)] rounded-2xl p-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--borderColor)]">
            <th className="px-4 py-3 text-left">User</th>
            <th className="px-4 py-3 text-left">Action</th>
            <th className="px-4 py-3 text-left">IP</th>
            <th className="px-4 py-3 text-left">Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l, i) => (
            <tr key={i} className="border-b border-[var(--borderColor)]">
              <td className="px-4 py-3">{l.userName}</td>
              <td className="px-4 py-3">{l.action}</td>
              <td className="px-4 py-3">{l.ip}</td>
              <td className="px-4 py-3">
                {new Date(l.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ===================================================
   MAIN PAGE
=================================================== */
export default function UserManagement() {
  const [tab, setTab] = useState("users");
  const [editUser, setEditUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateRole, setShowCreateRole] = useState(false);

  return (
    <ProtectedRoute roles={["superadmin", "hr_manager"]}>
      <div className="min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-[var(--textPrimary)]">
          User Management
        </h1>

        <div className="flex gap-6 border-b border-[var(--borderColor)] mb-6">
          {["users", "roles", "activity"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium ${
                tab === t
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-[var(--textSecondary)]"
              }`}
            >
              {t === "users"
                ? "User List"
                : t === "roles"
                ? "Roles & Permissions"
                : "Activity Log"}
            </button>
          ))}
        </div>

        {tab === "users" && (
          <UserList
            refreshKey={refreshKey}
            onEditPermissions={setEditUser}
          />
        )}

        {tab === "roles" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[var(--textPrimary)]">
                Roles & Permissions
              </h2>
              <button
                onClick={() => setShowCreateRole(true)}
                className="px-4 py-2 bg-[var(--accent-green)] rounded-lg text-sm flex items-center gap-2"
              >
                <Plus size={16} /> Create Role
              </button>
            </div>
            <RolesPermissions />
          </>
        )}

        {tab === "activity" && <ActivityLog />}

        {editUser && (
          <EditPermissionsModal
            user={editUser}
            onClose={() => setEditUser(null)}
          />
        )}

        <CreateRoleModal
          isOpen={showCreateRole}
          onClose={() => setShowCreateRole(false)}
          onCreated={() => setRefreshKey(k => k + 1)}
        />
      </div>
    </ProtectedRoute>
  );
}
