"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

/* ================= TYPES ================= */
interface Profile {
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const [profile, setProfile] = useState<Profile>({
    name: "User",
    email: "user@system.com",
    role: "Admin",
  });

  const [loading, setLoading] = useState(true);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
 const loadProfile = async () => {
  try {
    const res = await fetchWithAuth(
      `${API}/api/profile/me`
    );

  if (!res || !res.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await res.json();

    // 🔥 Important: Adjust to backend structure
    const user = data.user || data;

    setProfile({
      name: user.name,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    console.error("Profile load error:", error);
    router.push("/admin/login");
  } finally {
    setLoading(false);
  }
};

    loadProfile();
  }, [API]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
  sessionStorage.clear();
  localStorage.clear();
  router.push("/");
};


  /* ================= UI ================= */
  return (
    <div className=" mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

        <button
          onClick={handleLogout}
          className="px-7 py-2 bg-green-300 text-white rounded-lg hover:bg-green-400 transition"
        >
          Logout
        </button>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Account Details</h2>

        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Info label="Full Name" value={profile.name} />
            <Info label="Email" value={profile.email} />
            <Info label="Role" value={profile.role} />
          </div>
        )}
      </div>

      {/* CHANGE PASSWORD */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mt-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        <form className="space-y-4 max-w-md">
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

          <button
            type="button"
            className="px-6 py-3 bg-green-300 text-white rounded-lg hover:bg-green-400 transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <p className="mt-1 text-gray-800 font-medium">{value}</p>
    </div>
  );
}
