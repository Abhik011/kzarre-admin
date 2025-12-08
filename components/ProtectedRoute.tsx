"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuth from "@/app/hooks/useAuth"; // ✅ Import refresh hook

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const router = useRouter();

  // 🔥 This activates refresh token every 14 min
  const { token, loading } = useAuth();

  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return; // wait until token loads

    const token_super = localStorage.getItem("superadmin_token");
    const token_admin = localStorage.getItem("admin_token");

    let role = null;

    if (token_super) {
      role = "superadmin";
    } else if (token_admin) {
      role = localStorage.getItem("admin_role");
    }

    // ❌ No token → redirect
    if (!role) {
      router.push("/");
      return;
    }

    // Store role globally
    localStorage.setItem("role", role);

    // ❌ Role not allowed for this page
    if (roles && !roles.includes(role)) {
      router.push("/unauthorized");
      return;
    }

    setAuthorized(true);
  }, [loading, router, roles]); // added "loading"

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500" />
      </div>
    );
  }

  return <>{children}</>;
}
