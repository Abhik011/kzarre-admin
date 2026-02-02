"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
// import { notifications } from "@/lib/notifications";


export default function AdminLogin() {
  const { login } = useAuthStore();
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

//  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//   e.preventDefault();
//   setLoading(true);
//   setError("");

//   try {
//     console.log("Admin Login: Starting login process");
//     // const response = await fetch(`${API_BASE}/api/admin/login`, {
//     //   method: "POST",
//     //   headers: { "Content-Type": "application/json" },
//     //   credentials: "include",
//     //   body: JSON.stringify(form),
//     // });

//     const response = await fetch(`${API_BASE}/api/admin/login`, {
      
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify(form),
// });

//     const data = await response.json();
//     console.log("FULL LOGIN RESPONSE:", data);

//     if (!response.ok) {
//       throw new Error(data.message || "Invalid credentials");
//     }

//     console.log("Admin Login: API response received", data);
    

//     // Store authentication data securely using Zustand store
//     const userPermissions = data.admin.permissions || [];
//     const defaultPermissions = [
//       "view_dashboard",
//       "manage_users",
//       "create_user",
//       "update_user",
//       "delete_user",
//       "manage_cms",
//       "view_analytics",
//       "manage_orders",
//       "manage_inventory",
//       "manage_stories",
//       "manage_shipping",
//       "view_crm",
//       "manage_marketing",
//       "manage_security",
//       "manage_settings"
//     ];

//     // If user has no permissions, give them default admin permissions
//     const finalPermissions = userPermissions.length > 0 ? userPermissions : defaultPermissions;

//     const userRole = data.admin.role || "Admin";

//     console.log("Admin Login: Setting role to:", userRole);
//     console.log("Admin Login: Setting permissions:", finalPermissions);

//     login(data.accessToken, {
//       _id: data.admin._id,
//       name: data.admin.name,
//       email: data.admin.email,
//       role: userRole,
//       permissions: finalPermissions,
//     });

//     console.log("Admin Login: Zustand state updated");

//     // Success notification
//     console.log("Login successful - Welcome back to KZARRÈ Admin!");

//     // Small delay to ensure cookies are set before redirect
//     setTimeout(() => {
//       console.log("Admin Login: Redirecting to dashboard");
//       window.location.href = "/dashboard";
//     }, 1000);

//   } catch (err: any) {
//     setError(err?.message || "Something went wrong");
//   } finally {
//     setLoading(false);
//   }
// };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    console.log("FULL LOGIN RESPONSE:", data);

    if (!response.ok) {
      throw new Error(data.message || "Invalid credentials");
    }

    // 🔥 FIX: read correct token field
    const token = data.accessToken || data.token;

    console.log("TOKEN USED:", token);

    if (!token) {
      throw new Error("No token received from backend");
    }

    const userPermissions = data.admin.permissions || [];
    const defaultPermissions = [
      "view_dashboard",
      "manage_users",
      "create_user",
      "update_user",
      "delete_user",
      "manage_cms",
      "view_analytics",
      "manage_orders",
      "manage_inventory",
      "manage_stories",
      "manage_shipping",
      "view_crm",
      "manage_marketing",
      "manage_security",
      "manage_settings"
    ];

    const finalPermissions =
      userPermissions.length > 0 ? userPermissions : defaultPermissions;

    const userRole = data.admin.role || "Admin";
    const storage = remember ? localStorage : sessionStorage;

// Save token manually for persistence strategy
storage.setItem("auth_token", token);
storage.setItem("auth_user", JSON.stringify({
  _id: data.admin._id,
  name: data.admin.name,
  email: data.admin.email,
  role: userRole,
  permissions: finalPermissions,
}));

 login(token, {
  _id: data.admin._id,
  name: data.admin.name,
  email: data.admin.email,
  role: userRole,
  permissions: finalPermissions,
});

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);

  } catch (err: any) {
    setError(err?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Admin Login
          </h1>
          <p className="text-gray-500 text-sm">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
  type="checkbox"
  checked={remember}
  onChange={(e) => setRemember(e.target.checked)}
  className="accent-indigo-500 rounded-sm"
/>

              Remember me
            </label>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
