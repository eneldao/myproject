"use client";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ClientSignup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form fields
      if (!fullName || !email || !password) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Call signup method to register user directly
      const response = await signup(email, password, fullName, "client", {
        companyName: companyName, // Changed from company_name to companyName to match API expectations
        contact_name: fullName,
        contact_email: email,
      });

      if (response.success) {
        // Store form data in sessionStorage for the manual registration page to use
        sessionStorage.setItem(
          "registrationFormData",
          JSON.stringify({
            email,
            fullName,
            userType: "client",
            companyName,
            userId: response.userId, // Include userId if available
          })
        );

        // Store password in localStorage for manual registration process
        localStorage.setItem(
          "pendingRegistration",
          JSON.stringify({
            email,
            password,
            fullName,
            userType: "client",
            userId: response.userId, // Include userId if available
          })
        );

        // If userId is available, go directly to client page
        if (response.userId) {
          // Try to insert into client table
          const { error: clientError } = await supabase.from("clients").insert({
            id: response.userId,
            user_id: response.userId,
            company_name: companyName || "",
            contact_name: fullName,
            contact_email: email,
            balance: 0,
          });

          if (clientError) {
            console.error("Error creating client profile:", clientError);
            // Continue to manual registration for fallback
            router.push(
              `/signup/manual-registration?email=${encodeURIComponent(
                email
              )}&type=client`
            );
            return;
          }

          router.push(`/clients/${response.userId}`);
        } else {
          // Otherwise go to manual registration page for completion
          router.push(
            `/signup/manual-registration?email=${encodeURIComponent(
              email
            )}&type=client`
          );
        }
      } else {
        setError(response.error?.message || "Signup failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create a Client Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label
                htmlFor="full-name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                required
                className="relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="company-name"
                className="block text-sm font-medium text-gray-700"
              >
                Company Name
              </label>
              <input
                id="company-name"
                name="companyName"
                type="text"
                className="relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-2">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-300"
            >
              {loading ? "Creating account..." : "Create Client Account"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/signup/freelancer"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              I'm a freelancer, not a client
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
