"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isSuperAdmin?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5500";

// 🔥 ROLE NORMALIZER (VERY IMPORTANT)
const normalizeRole = (role?: string) => {
  if (!role) return "admin";
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
        console.log("Auth Store: Login called with token:", !!token, "user:", user);

        const normalizedUser: User = {
          ...user,
          role: normalizeRole(user.role),
          permissions: user.permissions || [],
          isSuperAdmin: user.isSuperAdmin ?? false,
        };

        Cookies.set(TOKEN_KEY, token, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: 7,
        });

        set({
          token,
          user: normalizedUser,
          isAuthenticated: true,
          isLoading: false,
        });

        console.log("Auth Store: Zustand state updated");
      },

      // =====================
      // LOGOUT
      // =====================
      logout: () => {
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(USER_KEY);

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
          localStorage.removeItem("permissions");
          localStorage.removeItem("admin_token");
          localStorage.removeItem("role");
        }
      },

      // =====================
      // REFRESH TOKEN
      // =====================
      refreshToken: async () => {
        try {
          set({ isLoading: true });

          const { user } = get();

          const refreshEndpoint = "/api/auth/refresh";


          console.log("Auth Store: Refreshing token using endpoint:", refreshEndpoint);

          const response = await fetch(`${API_BASE}${refreshEndpoint}`, {
            method: "POST",
            credentials: "include",
          });

          console.log("Auth Store: Refresh response status:", response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Auth Store: Refresh failed:", errorText);
            throw new Error("Token refresh failed");
          }

          const data = await response.json();
          console.log("Auth Store: Refresh response data:", data);

          if (data.accessToken) {
            Cookies.set(TOKEN_KEY, data.accessToken, {
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              expires: 7,
            });

            set({ token: data.accessToken });
            console.log("Auth Store: Token refreshed successfully");
          } else {
            console.log("Auth Store: No access token in refresh response");
            get().logout();
          }
        } catch (error) {
          console.error("Auth Store: Token refresh failed:", error);
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },

      // =====================
      // CHECK AUTH
      // =====================
      checkAuth: async () => {
        const now = Date.now();

        if (
          authVerificationCache.result !== null &&
          now - authVerificationCache.timestamp < authVerificationCache.ttl
        ) {
          console.log("Auth Store: Using cached result:", authVerificationCache.result);
          return authVerificationCache.result;
        }

        try {
          set({ isLoading: true });

          console.log("Auth Store: Verifying authentication with backend...");

          const currentUser = get().user;

          const verifyEndpoint = "/api/auth/verify";


          console.log("Auth Store: Using verify endpoint:", verifyEndpoint);

          const response = await fetch(`${API_BASE}${verifyEndpoint}`, {
            credentials: "include",
            headers: {
              "Cache-Control": "no-cache",
            },
          });

          console.log("Auth Store: Verify response status:", response.status);

          const isAuthenticated = response.ok;

          authVerificationCache = {
            result: isAuthenticated,
            timestamp: now,
            ttl: isAuthenticated ? 30000 : 5000,
          };

          if (!isAuthenticated) {
            console.log("Auth Store: Verification failed");
            set({ isAuthenticated: false, user: null, token: null });
            return false;
          }

          const data = await response.json();
          console.log("Auth Store: Verification successful, user:", data.user);

          // 🔥 NORMALIZE & GUARANTEE ROLE HERE
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

          return true;
        } catch (error) {
          console.error("Auth Store: Auth check failed:", error);

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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// =====================
// AUTH API HELPERS
// =====================
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  },

  superAdminLogin: async (email: string) => {
    const response = await fetch(`${API_BASE}/api/superadmin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  },

  verifyOTP: async (email: string, otp: string) => {
    const response = await fetch(`${API_BASE}/api/superadmin/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "OTP verification failed");
    }

    return data;
  },

  verifySuperAdminLogin: async (email: string, otp: string) => {
    const response = await fetch(`${API_BASE}/api/superadmin/login/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "OTP verification failed");
    }

    return data;
  },

  getAuthHeaders: () => {
    const token = Cookies.get(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  authenticatedFetch: async (url: string, options: RequestInit = {}) => {
    console.log(`Auth API: Making request to ${url}`);

    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Cache-Control": "no-cache",
        ...options.headers,
      },
    });

    console.log(`Auth API: Response status ${response.status} for ${url}`);

    if (response.status === 401) {
      console.log("Auth API: Token expired (401), attempting refresh...");

      try {
        await useAuthStore.getState().refreshToken();
        console.log("Auth API: Token refresh completed, retrying original request...");

        const retryResponse = await fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache",
            ...options.headers,
          },
        });

        console.log(
          `Auth API: Retry response status ${retryResponse.status} for ${url}`
        );
        return retryResponse;
      } catch (refreshError) {
        console.error("Auth API: Token refresh failed:", refreshError);
        useAuthStore.getState().logout();
        throw new Error("Authentication expired");
      }
    }

    return response;
  },
};

// =====================
// AUTO REFRESH
// =====================
if (typeof window !== "undefined") {
  setInterval(() => {
    const { isAuthenticated, refreshToken, user } = useAuthStore.getState();
    if (isAuthenticated) {
      console.log(
        "Auto token refresh: Checking token for user role:",
        user?.role
      );
      refreshToken();
    }
  }, 10 * 60 * 1000);
}
