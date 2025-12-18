"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuth from "@/app/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: string[]; // ✅ permission-based
}

export default function ProtectedRoute({
  children,
  permissions,
}: ProtectedRouteProps) {
  const router = useRouter();

  // 🔁 handles refresh token silently
  const { token, loading } = useAuth();

  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    // 🔐 Tokens
    const superToken = localStorage.getItem("superadmin_token");
    const adminToken = localStorage.getItem("admin_token");

    // ❌ Not logged in
    if (!superToken && !adminToken) {
      router.replace("/");
      return;
    }

    // 🔥 SUPERADMIN = full access
    if (superToken) {
      localStorage.setItem("role", "superadmin");
      setAuthorized(true);
      return;
    }

    // 👤 Normal admin/staff
    const storedPermissions = localStorage.getItem("permissions");
    const userPermissions: string[] = storedPermissions
      ? JSON.parse(storedPermissions)
      : [];

    // ❌ Permissions missing
    if (!permissions || permissions.length === 0) {
      setAuthorized(true);
      return;
    }

    const hasPermission = permissions.some((p) =>
      userPermissions.includes(p)
    );

    if (!hasPermission) {
      router.replace("/unauthorized");
      return;
    }

    setAuthorized(true);
  }, [loading, permissions, router]);

  // ⏳ Loading UI
  if (authorized === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500" />
      </div>
    );
  }

  return <>{children}</>;
}
