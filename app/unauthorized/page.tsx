// src/app/unauthorized/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleRedirect = () => {
    sessionStorage.clear();
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center bg-white shadow-xl rounded-2xl p-8">
        
        {/* Industrial Vector */}
        <div className="flex justify-center mb-6">
          <svg
            width="160"
            height="160"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="90" fill="#FEE2E2" />
            <rect x="55" y="60" width="90" height="70" rx="8" fill="#DC2626" />
            <rect x="70" y="75" width="60" height="10" rx="5" fill="#FCA5A5" />
            <rect x="70" y="95" width="40" height="10" rx="5" fill="#FCA5A5" />
            <path
              d="M100 40 L110 60 H90 L100 40Z"
              fill="#DC2626"
            />
          </svg>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Access Denied
        </h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          You don’t have the required permissions to view this page.
          Please sign in with an authorized account.
        </p>

        {/* Action */}
        <button
          onClick={handleRedirect}
          className="w-full py-3 rounded-lg bg-red-600 text-white font-semibold 
                     hover:bg-red-700 active:scale-95 transition-all duration-200 shadow-md"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
