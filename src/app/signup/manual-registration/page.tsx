"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ManualRegistration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const type = searchParams?.get("type") || "";
  const [formData, setFormData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("Your registration is complete!");
  const [error, setError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(5);

  useEffect(() => {
    // Retrieve form data from sessionStorage
    const storedData = sessionStorage.getItem("registrationFormData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setFormData(parsedData);
      } catch (err) {
        console.error("Error parsing form data:", err);
        setError("There was an error processing your registration data.");
      }
    } else {
      setError("No registration data found. Please try signing up again.");
    }
  }, []);

  // Handle countdown timer for redirection
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0) {
      // Clean up sensitive data
      sessionStorage.removeItem("registrationFormData");
      router.push("/auth/signin");
    }
  }, [redirectCountdown, router]);

  const processRegistration = async (data: any) => {
    if (isProcessing) return; // Prevent multiple calls
    setIsProcessing(true);

    try {
      // Get password from localStorage
      const storedRegistration = localStorage.getItem("pendingRegistration");

      if (!storedRegistration) {
        setError("No registration data found. Please try signing up again.");
        setIsProcessing(false);
        return;
      }

      const registrationData = JSON.parse(storedRegistration);
      const password = registrationData.password;

      if (!password) {
        setError("No password found. Please try signing up again.");
        setIsProcessing(false);
        return;
      }

      // Try the primary registration method first
      setStatus("Creating your account...");

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: password,
          fullName: data.fullName,
          type: data.userType,
          title: data.title,
          description: data.description,
          hourlyRate: data.hourlyRate,
          companyName: data.companyName,
        }),
      });

      const result = await response.json();
      console.log("Registration result:", result);

      if (response.ok && result.success) {
        console.log("User successfully registered with ID:", result.userId);
        finishRegistration(data.email, password);
      } else {
        console.log("Registration failed:", result.error || "Unknown error");
        setError(result.error || "An unexpected error occurred.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Error in registration process:", err);
      setError("An unexpected error occurred. Please try again later.");
      setIsProcessing(false);
    }
  };

  // Helper to finish the registration process
  const finishRegistration = async (email: string, password: string) => {
    try {
      // Retrieve the registration data with userId if available
      const storedRegistration = localStorage.getItem("pendingRegistration");
      const registrationData = storedRegistration
        ? JSON.parse(storedRegistration)
        : null;
      const userId = registrationData?.userId;
      const userType = registrationData?.userType || formData?.userType;

      // Registration completed successfully
      setStatus("Registration completed successfully!");
      setIsProcessing(false);

      // Clean up sensitive data
      localStorage.removeItem("pendingRegistration");
      sessionStorage.removeItem("registrationFormData");

      // If we have a userId, redirect to the appropriate profile page
      if (userId) {
        setStatus(`Redirecting to your ${userType} dashboard...`);
        setTimeout(() => {
          if (userType === "freelancer") {
            router.push(`/freelancers/${userId}`);
          } else if (userType === "client") {
            router.push(`/clients/${userId}`);
          } else {
            router.push("/auth/signin"); // Fallback
          }
        }, 1000);
      } else {
        // Set countdown for auto-redirect to login
        setRedirectCountdown(5);
      }
    } catch (err) {
      console.error("Error in finishRegistration:", err);
      setError(
        "Registration completed, but auto-login failed. You can log in manually."
      );
      setIsProcessing(false);

      // Fallback to login redirect
      setRedirectCountdown(5);
    }
  };

  useEffect(() => {
    // If there's form data available when the component mounts, process the registration
    if (formData && !isProcessing) {
      processRegistration(formData);
    }
  }, [formData, isProcessing]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Registration Complete
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Thank you for registering as a {type}
          </p>
        </div>

        {isProcessing ? (
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex items-center">
              <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">{status}</h3>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Registration Complete!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your {type} account has been created successfully. You can
                    now log in with your email and password.
                  </p>
                  {redirectCountdown !== null && (
                    <p className="mt-2 font-medium">
                      Redirecting to login page in {redirectCountdown}{" "}
                      seconds...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {formData && !isProcessing && (
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium text-gray-700 mb-2">
              Registration Summary
            </h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Name:</span> {formData.fullName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {formData.email}
              </p>
              <p>
                <span className="font-medium">Account Type:</span>{" "}
                {formData.userType}
              </p>
              {formData.userType === "freelancer" && (
                <>
                  <p>
                    <span className="font-medium">Professional Title:</span>{" "}
                    {formData.title}
                  </p>
                  {formData.description && (
                    <p>
                      <span className="font-medium">Description:</span>{" "}
                      {formData.description}
                    </p>
                  )}
                  {formData.hourlyRate > 0 && (
                    <p>
                      <span className="font-medium">Hourly Rate:</span> $
                      {formData.hourlyRate}/hr
                    </p>
                  )}
                </>
              )}
              {formData.userType === "client" && formData.companyName && (
                <p>
                  <span className="font-medium">Company:</span>{" "}
                  {formData.companyName}
                </p>
              )}
            </div>
          </div>
        )}

        {!isProcessing && (
          <div className="text-center space-y-4">
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Go to Login
            </Link>
            <p className="text-sm text-gray-500">
              You can now log in with your email and password.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
