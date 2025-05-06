"use client";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function FreelancerSignup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConfirmationView, setIsConfirmationView] = useState(false); // New state for confirmation view

  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (loading) return; // Prevent duplicate submissions
    setLoading(true);

    try {
      // Validate form fields
      if (!fullName || !email || !password || !title) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Call signup method to register user directly
      const response = await signup(email, password, fullName, "freelancer", {
        title,
        description,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : 0,
      });

      if (response.success) {
        // Store form data in sessionStorage
        sessionStorage.setItem(
          "registrationFormData",
          JSON.stringify({
            email,
            fullName,
            userType: "freelancer",
            title,
            description,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0,
            userId: response.userId,
          })
        );

        // Store password in localStorage
        localStorage.setItem(
          "pendingRegistration",
          JSON.stringify({
            email,
            password,
            fullName,
            userType: "freelancer",
            userId: response.userId,
          })
        );

        // Show confirmation view instead of redirecting
        setIsConfirmationView(true);
        setLoading(false);

        // If userId is available, create freelancer profile in the background
        if (response.userId) {
          // Try to insert into freelancer table
          const { error: freelancerError } = await supabase
            .from("freelancers")
            .insert({
              id: response.userId,
              full_name: fullName,
              email: email,
              title: title,
              description: description || "",
              hourly_rate: hourlyRate ? parseFloat(hourlyRate) : 0,
              languages: [],
              services: [title].filter(Boolean),
              rating: 0,
              reviews_count: 0,
              completed_projects: 0,
              response_time: "N/A",
              balance: 0,
            });

          if (freelancerError) {
            console.error(
              "Error creating freelancer profile:",
              freelancerError
            );
          }
        }
      } else {
        setError(response.error?.message || "Signup failed. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  // If we're showing the confirmation view, render that instead of the form
  if (isConfirmationView) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a verification link to <strong>{email}</strong>
            </p>
          </div>

          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Verify your email address
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Please check your email inbox and click the verification
                    link to complete your freelancer registration. If you don't
                    see it within a few minutes, check your spam folder.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              After verifying your email, you'll be able to log in to your
              account.
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create a Freelancer Account
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
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Service Type
              </label>
              <select
                id="title"
                name="title"
                required
                className="relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              >
                <option value="">Select a service</option>
                <option value="Voiceover">Voiceover</option>
                <option value="Dubbing">Dubbing</option>
                <option value="Translator">Translator</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Tell clients about your skills and experience"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="hourly-rate"
                className="block text-sm font-medium text-gray-700"
              >
                Hourly Rate ($)
              </label>
              <input
                id="hourly-rate"
                name="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                className="relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="50.00"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
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
              className={`group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-3 text-sm font-semibold text-white ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-500"
              }`}
            >
              {loading ? "Creating account..." : "Create Freelancer Account"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/signup/client"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              I'm a client, not a freelancer
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
