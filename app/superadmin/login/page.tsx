"use client";
import { useState, useEffect } from "react";
import { Mail, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [canRegister, setCanRegister] = useState(false); // 🔐 Check if registration allowed

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  // ✅ Check from backend if SuperAdmin registration is open (only for first setup)
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/superadmin/status`);
        const data = await res.json();
        if (data.canRegister) setCanRegister(true);
      } catch {
        setCanRegister(false);
      }
    };
    checkSuperAdminStatus();
  }, [API_BASE]);

  // ✅ Handle Login Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/superadmin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("superadmin_email", email);

      setMessage("✅ OTP sent to your email.");
      setTimeout(() => router.push("/superadmin/verify-login"), 1000);
   } catch (err) {
  const message = err instanceof Error ? err.message : "Something went wrong";
  setError(message);
}

  };

  // ✅ Handle Register Click
  const handleRegister = () => {
    if (canRegister) router.push("/superadmin/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D0D0D] via-[#1B1B1B] to-[#0B3D2E] p-4 relative overflow-hidden">
      {/* Floating background lights */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#A0EDA8]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />

      {/* Card */}
      <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4)] rounded-3xl p-8 w-full max-w-md z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-[#A0EDA8] rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <ShieldCheck size={36} className="text-black" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-wide">
            SuperAdmin Login
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Secure access to KZARRÈ Control Center
          </p>
        </div>

        {/* Messages */}
        {error && (
          <p className="bg-red-500/20 text-red-200 text-sm p-2 rounded mb-3 text-center">
            {error}
          </p>
        )}
        {message && (
          <p className="bg-[var(--accent-green)] text-green-200 text-sm p-2 rounded mb-3 text-center">
            {message}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-white/70" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/15 badge-text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#A0EDA8] transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-[#A0EDA8] to-yellow-400 text-black font-semibold rounded-xl shadow-lg hover:shadow-yellow-400/20 transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin text-black" />}
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="text-white/50 text-xs">or</span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        {/* Conditional Register Button */}
        {/* <button
          onClick={handleRegister}
          // disabled={!canRegister}
          className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
            canRegister
              ? "bg-transparent border border-[#A0EDA8]/40 text-white hover:bg-[#A0EDA8]/20"
              : "bg-gray-700/60 text-gray-400 cursor-not-allowed border border-gray-600"
          }`}
        >
          {canRegister ? " Register as Super Admin" : "Registration Disabled"}
        </button> */}

         <button
          onClick={handleRegister}
          // disabled={!canRegister}
          className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
            canRegister
              ? "bg-transparent border border-[#A0EDA8]/40 text-white hover:bg-[#A0EDA8]/20"
              : "bg-gray-700/60 text-gray-400 cursor-not-allowed border border-gray-600"
          }`}
        >
          {canRegister ? " Register as Super Admin" : "Registration Disabled"}
        </button>
      </div>

    </div>
  );
}
