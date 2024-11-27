// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleLogin = async () => {
    try {
      await signIn("spotify", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Please sign in to continue</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full rounded-lg bg-[#1DB954] px-4 py-3 text-white hover:bg-[#1ed760] transition-colors"
        >
          Continue with Spotify
        </button>
      </div>
    </div>
  );
}
