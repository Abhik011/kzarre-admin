"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://kzarre.local:5000";

// -------------------------------------------------------
// 🔍 Choose refresh API depending on logged-in role
// -------------------------------------------------------
const getRefreshRoute = () => {
  if (typeof window === "undefined") return "/api/superadmin/refresh";

  const role = localStorage.getItem("role");
  const adminRole = localStorage.getItem("admin_role");

  if (role === "superadmin") return "/api/superadmin/refresh";
  if (adminRole === "admin") return "/api/usersadmin/refresh";

  return "/api/superadmin/refresh"; // fallback
};

export default function useAuth() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------
  // ⛔ Skip on login pages
  // -------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const skipRoutes = [
      "/superadmin/login",
      "/superadmin/verify-login",
      "/admin/login",
    ];

    if (skipRoutes.includes(window.location.pathname)) {
      console.log("⛔ Skipping useAuth on auth page");
      setLoading(false);
    }
  }, []);

  // -------------------------------------------------------
  // 🔁 Refresh access token using cookie
  // -------------------------------------------------------
  const refreshAccessToken = useCallback(async () => {
    if (typeof window === "undefined") return null;

    const refreshRoute = getRefreshRoute();
    console.log("🔄 Refresh Endpoint:", refreshRoute);

    try {
      const res = await fetch(`${API_BASE}${refreshRoute}`, {
        method: "POST",
        credentials: "include", // 🔥 VERY IMPORTANT
      });

      console.log("📡 Refresh Response Status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Refresh failed:", errorText);
        return null;
      }

      const data = await res.json();

      if (data.accessToken) {
        localStorage.setItem("admin_token", data.accessToken);
        setToken(data.accessToken);
        console.log("✅ Token refreshed");
        return data.accessToken;
      }

      console.warn("⚠️ Backend returned no accessToken");
      return null;
    } catch (err) {
      console.error("🔥 Refresh error:", err);
      return null;
    }
  }, []);

  // -------------------------------------------------------
  // 🔐 Load token on first load
  // -------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("admin_token");

    if (!stored) {
      console.log("⚠️ No token found. Trying refresh...");
      refreshAccessToken().finally(() => setLoading(false));
      return;
    }

    setToken(stored);

    // Try refreshing in background anyway
    refreshAccessToken().finally(() => setLoading(false));
  }, [refreshAccessToken]);

  // -------------------------------------------------------
  // ⏱ Auto-refresh every 14 min
  // -------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshAccessToken]);

  return { token, setToken, refreshAccessToken, loading };
}
