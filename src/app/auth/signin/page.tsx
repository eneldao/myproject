"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("Form submitted for:", email); // Debug log

      const result = await login(email, password);
      console.log("Login result:", result); // Debug log

      if (result.success) {
        console.log("Login successful, redirecting..."); // Debug log

        // Redirect based on user role
        if (email === "admin@example.com") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setErrorMessage(result.error?.message || "Failed to sign in.");
      }
    } catch (error: any) {
      console.error("Sign-in error:", error); // Debug log
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-r from-[#001F3F] to-[#003366]">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-8 rounded-xl">
        <h2 className="text-center text-3xl font-extrabold text-white">
          Sign in to your account
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              id="email"
              type="email"
              required
              placeholder="Email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-[#00BFFF] focus:border-[#00BFFF]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              id="password"
              type="password"
              required
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-[#00BFFF] focus:border-[#00BFFF]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMessage && (
            <div className="text-red-500 text-sm text-center">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 text-white bg-[#00BFFF] hover:bg-[#0099CC] rounded-md disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-300">
          <Link
            href="/auth/signup"
            className="font-medium text-[#00BFFF] hover:text-[#0099CC]"
          >
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
      {/* Debug info (remove in production) */}
      <div className="mt-8 text-xs text-gray-400">
        <div>Debug mode</div>
        <div>Email: {email}</div>
        <div>Error: {errorMessage}</div>
      </div>
    </div>
  );
}
