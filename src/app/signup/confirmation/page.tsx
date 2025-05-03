"use client"; // Fix for export error
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

// Confirmation page loaded
export default function SignupConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "your email";
  const type = searchParams?.get("type") || "account";
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    console.log("SignupConfirmation page loaded"); // Add this line
    // Mark page as loaded - helps ensure client-side code is running
    setPageLoaded(true);

    // Verify that we have the necessary URL parameters
    if (!searchParams?.get("email")) {
      console.warn("No email provided in URL parameters");
    }

    // Log current path to help with debugging
    console.log("Current path:", window.location.pathname);

    // Verify the page is correctly mounted at the expected route
    if (window.location.pathname !== "/signup/confirmation") {
      console.error(
        "Page mounted at incorrect path:",
        window.location.pathname
      );
    }
  }, [searchParams]);

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
                  Please check your email inbox and click the verification link
                  to complete your {type} registration. If you don't see it
                  within a few minutes, check your spam folder.
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
