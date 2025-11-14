"use client";

import React, { useEffect, useState } from "react";
import { MoreVertical, Plus, X, Shield } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
// ===== Constants =====
const API_BASE = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/usersadmin`;

const roleGroups = [
  "sales_manager",
  "inventory_manager",
  "hr_manager",
  "finance_manager",
];

const samplePermissions = [
  "create_user",
  "delete_user",
  "update_user",
  "view_reports",
  "manage_inventory",
  "view_dashboard",
];

// ===================================================
// ✅ User List
// ===================================================
const UserList = ({ refreshKey, onEditPermissions }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("superadmin_token") ||
          localStorage.getItem("admin_token");

        // ✅ Correct API path
        const res = await fetch(`${API_BASE}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Check for errors before parsing
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Error ${res.status}`);
        }

        const data = await res.json();

        // ✅ Validate array response
        if (!Array.isArray(data)) {
          console.warn("Unexpected response:", data);
          setUsers([]);
        } else {
          setUsers(data);
        }
      } catch (err) {
        console.error("Error fetching users:", err.message);
        setUsers([]); // avoid crash if response invalid
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [refreshKey]);

  const toggleActive = async (id) => {
    try {
      const token =
        localStorage.getItem("superadmin_token") ||
        localStorage.getItem("admin_token");

      const res = await fetch(`${API_BASE}/toggle-active/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Failed to toggle user status");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-2">User List</h3>
      <p className="text-sm text-gray-600 mb-4">Manage system users</p>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500 text-sm">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Group</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>
                  <td className="px-4 py-3 text-gray-700">{u.role}</td>
                  <td className="px-4 py-3 text-gray-700">{u.group}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        u.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <button
                      onClick={() => onEditPermissions(u)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center gap-1"
                    >
                      <Shield size={14} /> Edit
                    </button>
                    <button
                      onClick={() => toggleActive(u._id)}
                      className={`text-xs ${
                        u.isActive
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ===================================================
// ✅ Add User Modal
// ===================================================
const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    group: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token =
      localStorage.getItem("superadmin_token") ||
      localStorage.getItem("admin_token");

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: "admin",
          group: form.group,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("✅ User created successfully");
      onUserAdded();
      onClose();
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder="First name"
              required
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <input
              placeholder="Last name"
              required
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <input
            type="email"
            placeholder="Email address"
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <select
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            required
            onChange={(e) => setForm({ ...form, group: e.target.value })}
          >
            <option value="">Select Role Group</option>
            {roleGroups.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================================================
// ✅ Permissions Modal
// ===================================================
const EditPermissionsModal = ({ user, onClose }) => {
  const [selected, setSelected] = useState(user?.permissions || []);

  const handleToggle = (p) => {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSave = async () => {
    try {
      const token =
        localStorage.getItem("superadmin_token") ||
        localStorage.getItem("admin_token");

      const res = await fetch(`${API_BASE}/update-permissions/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("✅ Permissions updated");
      onClose();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-lg p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-lg font-bold">Edit Permissions - {user.name}</h2>
          <button onClick={onClose}>
            <X size={22} className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {samplePermissions.map((perm) => (
            <label key={perm} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(perm)}
                onChange={() => handleToggle(perm)}
                className="accent-green-500"
              />
              {perm}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// ===================================================
// ✅ Activity Log
// ===================================================
const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const token = localStorage.getItem("superadmin_token");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/activity`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Error fetching logs:", data.message);
          setLoading(false);
          return;
        }

        const formatted = data.logs.map((log, index) => ({
          id: index + 1,
          user: log.user,
          action: log.action,
          ip: log.ip || "Unknown IP",
          time: log.timestamp
            ? new Date(log.timestamp).toLocaleString()
            : "Unknown",
        }));

        setLogs(formatted);
      } catch (err) {
        console.error("Activity Log Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Activity Log</h3>
      <p className="text-sm text-gray-600 mb-4">
        Recent administrative actions
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold">User</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
              <th className="px-4 py-3 text-left font-semibold">IP</th>
              <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  Loading activity...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No activity found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{log.user}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3">{log.ip}</td>
                  <td className="px-4 py-3">{log.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Activity Log</h3>
      <p className="text-sm text-gray-600 mb-4">
        Recent administrative actions
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold">User</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
              <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
              <th className="px-4 py-3 text-left font-semibold">Ip address</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  Loading activity...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  No activity found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{log.user}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3 text-gray-600">{log.time}</td>
                  <td className="px-4 py-3 text-gray-600">{log.Ip}</td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===================================================
// ✅ Main User Management Page
// ===================================================
export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("userList");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <ProtectedRoute roles={["superadmin", "hr_manager"]}>
      <div className="bg-gray-50 min-h-screen">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            User Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage and control system users
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 mb-6">
          <div className="flex gap-4 sm:gap-8 border-b border-gray-200 w-full sm:w-auto overflow-x-auto">
            {["userList", "rolesPermissions", "activityLog"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 font-medium text-sm ${
                  activeTab === tab
                    ? "text-green-600 border-b-2 border-green-500"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab === "userList"
                  ? "User List"
                  : tab === "rolesPermissions"
                  ? "Roles & Permissions"
                  : "Activity Log"}
              </button>
            ))}
          </div>

          {activeTab === "userList" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-[#A0EDA8] text-black rounded-lg hover:bg-green-500 hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm"
            >
              <Plus size={18} /> Add User
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "userList" && (
          <UserList
            refreshKey={refreshKey}
            onEditPermissions={(u) => setEditUser(u)}
          />
        )}
        {activeTab === "rolesPermissions" && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Roles & Permissions
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage system-level access groups
            </p>
            <p className="text-sm text-gray-700">
              (Coming soon — can connect with backend role management)
            </p>
          </div>
        )}
        {activeTab === "activityLog" && <ActivityLog />}

        {/* Modals */}
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onUserAdded={() => setRefreshKey((k) => k + 1)}
        />
        {editUser && (
          <EditPermissionsModal
            user={editUser}
            onClose={() => setEditUser(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
