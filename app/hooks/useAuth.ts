"use client";

import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";

export default function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);

  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (data?.accessToken) {
        localStorage.setItem("admin_token", data.accessToken);
        setToken(data.accessToken);
        return data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    if (stored) setToken(stored);

    refreshAccessToken().finally(() => setLoading(false));
  }, [refreshAccessToken]);

  useEffect(() => {
    if (!token) return;
    const i = setInterval(refreshAccessToken, 14 * 60 * 1000);
    return () => clearInterval(i);
  }, [token, refreshAccessToken]);

  return { token, loading };
}
