"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuth from "@/app/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: string[];
  roles?: string[];
}

export default function ProtectedRoute({
  children,
  permissions = [],
  roles = [],
}: ProtectedRouteProps) {
  const router = useRouter();
  const { loading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    const token = localStorage.getItem("admin_token");
    const role = localStorage.getItem("admin_role");
    const storedPermissions = localStorage.getItem("permissions");

    const userPermissions: string[] = storedPermissions
      ? JSON.parse(storedPermissions)
      : [];

    // ❌ Not logged in
    if (!token) {
      router.replace("/");
      return;
    }

    // 🔥 SUPERADMIN = FULL ACCESS
    if (role === "superadmin") {
      setAuthorized(true);
      return;
    }

    // 🔐 ROLE CHECK (FIRST)
    if (roles.length > 0 && !roles.includes(role || "")) {
      router.replace("/unauthorized");
      return;
    }

    // 🔓 No permission required
    if (permissions.length === 0) {
      setAuthorized(true);
      return;
    }

    // 🔐 PERMISSION CHECK
    const allowed = permissions.some(p =>
      userPermissions.includes(p)
    );

    if (!allowed) {
      router.replace("/unauthorized");
      return;
    }

    setAuthorized(true);
  }, [loading, permissions, roles, router]);

  // ⏳ Loading spinner
  if (authorized === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-t-4 border-green-500 rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
