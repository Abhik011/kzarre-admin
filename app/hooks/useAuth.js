"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";

export default function useAuth() {
  const pathname = usePathname();

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------
     🔁 Refresh access token using cookie
  ------------------------------------------------------- */
  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.warn("🔐 Refresh failed — clearing auth");
        localStorage.removeItem("admin_token");
        setToken(null);
        return null;
      }

      const data = await res.json();

      if (data && data.accessToken) {
        localStorage.setItem("admin_token", data.accessToken);
        setToken(data.accessToken);
        return data.accessToken;
      }

      return null;
    } catch (err) {
      console.error("🔥 Refresh error:", err);
      return null;
    }
  }, []);

  /* -------------------------------------------------------
     ⛔ Skip refresh on auth pages
  ------------------------------------------------------- */
  useEffect(() => {
    const skipRoutes = [
      "/admin/login",
      "/superadmin/login",
      "/superadmin/verify-login",
    ];

    if (skipRoutes.includes(pathname)) {
      setLoading(false);
      return;
    }

    const stored = localStorage.getItem("admin_token");
    if (stored) setToken(stored);

    refreshAccessToken().finally(() => setLoading(false));
  }, [pathname, refreshAccessToken]);

  /* -------------------------------------------------------
     ⏱ Auto refresh every 14 minutes
  ------------------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      refreshAccessToken();
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, refreshAccessToken]);

  return {
    token,
    setToken,
    refreshAccessToken,
    loading,
  };
}
