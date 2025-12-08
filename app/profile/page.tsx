"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const name =
    typeof window !== "undefined"
      ? localStorage.getItem("superadmin_name") ||
        localStorage.getItem("admin_name") ||
        "User"
      : "User";

  const email =
    typeof window !== "undefined"
      ? localStorage.getItem("superadmin_email") ||
        localStorage.getItem("admin_email") ||
        "user@system.com"
      : "user@system.com";

  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("role") || "Admin"
      : "Admin";

  // 🔥 Logout function
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("superadmin_token");
    localStorage.removeItem("superadmin_name");
    localStorage.removeItem("superadmin_email");

    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    localStorage.removeItem("admin_email");

    localStorage.removeItem("role");

    // Redirect to login
    router.push("/");
  };

  return (
    <div className="p-6">
      {/* Header Row with Logout */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

        <button
          onClick={handleLogout}
          className="px-7 py-2 bg-red-600 badge-text-white rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Account Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">Full Name</label>
            <p className="mt-1 text-gray-800 font-medium">{name}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="mt-1 text-gray-800 font-medium">{email}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Role</label>
            <p className="mt-1 text-gray-800 font-medium">{role}</p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mt-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        <form className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            className="w-full px-4 py-3 border rounded-lg focus:ring-black"
          />

          <input
            type="password"
            placeholder="New Password"
            className="w-full px-4 py-3 border rounded-lg focus:ring-black"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full px-4 py-3 border rounded-lg focus:ring-black"
          />

          <button className="px-6 py-3 bg-black badge-text-white rounded-lg hover:bg-gray-800">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
