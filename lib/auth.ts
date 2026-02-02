"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isSuperAdmin?: boolean;
}

export interface AuthState {
  [x: string]: any;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  
  checkAuth: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
}

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5500";

// 🔥 ROLE NORMALIZER
const normalizeRole = (role?: string) => {
  if (!role) return "Admin";
  if (role.toLowerCase() === "superadmin") return "SuperAdmin";
  return role;
};

// Cache for authentication verification
let authVerificationCache = {
  result: null as boolean | null,
  timestamp: 0,
  ttl: 30000,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // =====================
      // INITIAL STATE
      // =====================
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // =====================
      // LOGIN
      // =====================
      login: (token: string, user: User) => {
        console.log("Auth Store: Login called, token present =", !!token);

        const normalizedUser: User = {
          ...user,
          role: normalizeRole(user.role),
          permissions: user.permissions || [],
          isSuperAdmin: user.isSuperAdmin ?? false,
        };

        set({
          token,
          user: normalizedUser,
          isAuthenticated: true,
          isLoading: false,
        });

        console.log("Auth Store: Login successful, state updated");
      },

      // =====================
      // LOGOUT
      // =====================
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });

        authVerificationCache = {
          result: null,
          timestamp: 0,
          ttl: 30000,
        };

        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
          localStorage.removeItem("permissions");
          localStorage.removeItem("role");
        }

        console.log("Auth Store: Logged out");
      },

      // =====================
      // CHECK AUTH (🔥 CORE FIX)
      // =====================
      checkAuth: async () => {
        const now = Date.now();
        const token = get().token;

        console.log("checkAuth: token used =", token);

        if (!token) {
          set({ isAuthenticated: false, user: null });
          return false;
        }

        // Use cache to avoid spamming backend
        if (
          authVerificationCache.result !== null &&
          now - authVerificationCache.timestamp < authVerificationCache.ttl
        ) {
          console.log("checkAuth: Using cached result =", authVerificationCache.result);
          return authVerificationCache.result;
        }

        try {
          set({ isLoading: true });

          const response = await fetch(`${API_BASE}/api/auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`,   // 🔥 THIS IS THE KEY FIX
              "Cache-Control": "no-cache",
            },
          });

          console.log("checkAuth: verify status =", response.status);

          const isAuthenticated = response.ok;

          authVerificationCache = {
            result: isAuthenticated,
            timestamp: now,
            ttl: isAuthenticated ? 30000 : 5000,
          };

          if (!isAuthenticated) {
            console.log("checkAuth: Verification failed, logging out");
            set({ isAuthenticated: false, user: null, token: null });
            return false;
          }

          const data = await response.json();

          const prevUser = get().user;

          const normalizedUser: User = {
            _id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: normalizeRole(data.user.role || prevUser?.role),
            permissions: data.user.permissions || prevUser?.permissions || [],
            isSuperAdmin: data.user.isSuperAdmin ?? prevUser?.isSuperAdmin ?? false,
          };

          set({
            user: normalizedUser,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log("checkAuth: Verification success");

          return true;
        } catch (error) {
          console.error("checkAuth: Error during verify", error);

          authVerificationCache = {
            result: false,
            timestamp: now,
            ttl: 5000,
          };

          set({ isAuthenticated: false, user: null, token: null });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // =====================
      // PERMISSIONS
      // =====================
      hasPermission: (permission: string) => {
        const { user } = get();

        // 🔥 SuperAdmin has ALL permissions
        if (user?.role === "SuperAdmin" || user?.isSuperAdmin) {
          return true;
        }

        return user?.permissions?.includes(permission) || false;
      },
    }),
    {
      name: "auth-storage",
     storage: createJSONStorage(() => {
  if (typeof window === "undefined") return localStorage;

  // Use sessionStorage if token was saved there
  const hasSessionToken = sessionStorage.getItem("auth_token");

  return hasSessionToken ? sessionStorage : localStorage;
}),

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// =====================
// AUTH API HELPERS
// =====================
export const authApi = {
  authenticatedFetch: async (url: string, options: RequestInit = {}) => {
    const token = useAuthStore.getState().token;

    console.log(`authenticatedFetch: ${url}, token present =`, !!token);

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Cache-Control": "no-cache",
        ...options.headers,
      },
    });

    console.log(`authenticatedFetch: response status ${response.status}`);

    if (response.status === 401) {
      console.log("authenticatedFetch: 401 received, logging out");
      useAuthStore.getState().logout();
      throw new Error("Authentication expired");
    }

    return response;
  },
};
