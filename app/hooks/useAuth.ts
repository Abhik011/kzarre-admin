"use client";

import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";

export default function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 REFRESH ACCESS TOKEN (BEARER-ONLY)
  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = sessionStorage.getItem("refresh_token");
      if (!refreshToken) return null;

      const res = await fetch(`${API}/api/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`, // ✅ HERE
        },
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (data?.accessToken) {
        sessionStorage.setItem("access_token", data.accessToken);
        setAccessToken(data.accessToken);
        return data.accessToken;
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  // 🔄 INITIAL LOAD
  useEffect(() => {
    const storedAccess = sessionStorage.getItem("access_token");
    if (storedAccess) {
      setAccessToken(storedAccess);
    }

    refreshAccessToken().finally(() => setLoading(false));
  }, [refreshAccessToken]);

  // ⏱ AUTO REFRESH EVERY 14 MIN
  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(
      refreshAccessToken,
      14 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [accessToken, refreshAccessToken]);

  return {
    accessToken,
    loading,
    isAuthenticated: !!accessToken,
  };
}
