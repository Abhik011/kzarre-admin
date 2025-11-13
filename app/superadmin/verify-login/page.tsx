"use client";
import { useState } from "react";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerifySuperAdminLogin() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const email =
    typeof window !== "undefined"
      ? localStorage.getItem("superadmin_email")
      : "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/superadmin/login/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // store JWT token
      localStorage.setItem("superadmin_token", data.accessToken);
      localStorage.setItem("role", "superadmin");
      localStorage.removeItem("superadmin_email");
        console.log("Superadmin login response:", data);
      setSuccess("✅ Login successful!");
      setTimeout(() => router.push("/dashboard"), 1200);
   } catch (err) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError("Something went wrong");
  }
}

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D0D0D] via-[#1B1B1B] to-[#0B3D2E] p-4 relative overflow-hidden">
      {/* Floating luxury light effects */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#A0EDA8]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />

      {/* Glass Card */}
      <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4)] rounded-3xl p-8 w-full max-w-md z-10 transition-all duration-500">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-[#A0EDA8] rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <ShieldCheck size={36} className="text-black" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-wide">
            Verify Login OTP
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <p className="bg-red-500/20 text-red-200 text-sm p-2 rounded mb-3 text-center animate-fadeIn">
            {error}
          </p>
        )}
        {success && (
          <p className="bg-green-500/20 text-green-200 text-sm p-2 rounded mb-3 text-center animate-fadeIn">
            {success}
          </p>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 text-white/70" size={20} />
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
              maxLength={6}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/15 text-white placeholder-white/50 text-center tracking-[0.5em] text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#A0EDA8] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-[#A0EDA8] to-yellow-400 text-black font-semibold rounded-xl shadow-lg hover:shadow-yellow-400/20 transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin text-black" />}
            {loading ? "Verifying..." : "Verify Login"}
          </button>
        </form>

        {/* Resend option */}
        <p className="text-center text-sm text-white/60 mt-6">
          Didn’t receive the OTP?{" "}
          <span
            onClick={() => router.push("/superadmin/login")}
            className="text-[#A0EDA8] hover:underline cursor-pointer"
          >
            Resend OTP
          </span>
        </p>
      </div>
    </div>
  );
}
