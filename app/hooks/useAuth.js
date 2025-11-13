"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://192.168.0.215:5000";

export default function useAuth() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load existing token
  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    console.log("🔑 Loaded token from LocalStorage:", stored ? "YES" : "NO");
    if (stored) setToken(stored);
    setLoading(false);
  }, []);

  // 🔁 Refresh access token
  const refreshAccessToken = useCallback(async () => {
    console.log("🔄 Attempting silent token refresh...");

    try {
      console.log("🌐 Refresh API:", `${API_BASE}/api/superadmin/refresh`);

      const res = await fetch(`${API_BASE}/api/superadmin/refresh`, {
        method: "POST",
        credentials: "include", // MUST send refresh cookie
      });

      console.log("📡 Refresh Response Status:", res.status);

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ Refresh failed. Server said:", errText);
        throw new Error("Refresh failed");
      }

      const data = await res.json();
      console.log("📦 Refresh Response Data:", data);

      if (data.accessToken) {
        console.log("✅ Token refreshed successfully");
        localStorage.setItem("admin_token", data.accessToken);
        setToken(data.accessToken);
      } else {
        console.warn("⚠️ No accessToken returned from refresh endpoint");
      }
    } catch (err) {
      console.error("🔥 Silent refresh error:", err.message);
    }
  }, []);

  // 🕒 Auto-refresh token every 14 minutes
  useEffect(() => {
    console.log("⏱️ Auto-refresh timer started: every 14 minutes");
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 14 * 60 * 1000);

    return () => {
      console.log("🧹 Auto-refresh timer cleared");
      clearInterval(interval);
    };
  }, [refreshAccessToken]);

  return { token, setToken, refreshAccessToken, loading };
}
