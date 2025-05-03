"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [message, setMessage] = useState("Setting up your account...");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const setupUser = async () => {
      try {
        // Handle the OTP confirmation
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!data.session) {
          throw new Error("No session found");
        }

        const userId = data.session.user.id;
        const userMetadata = data.session.user.user_metadata;

        // Extract the data we stored during signup
        const fullName = userMetadata.full_name;
        const userType = userMetadata.user_type;
        const storedPassword = userMetadata.password;
        const additionalData = userMetadata.additionalData
          ? JSON.parse(userMetadata.additionalData)
          : {};

        // Set up the password if provided during signup
        if (storedPassword) {
          // Update the user's password
          await supabase.auth.updateUser({ password: storedPassword });
          setMessage("Password set successfully...");
        }

        // Create user record in the users table
        setMessage("Creating user record...");
        await supabase.from("users").insert({
          id: userId,
          email: data.session.user.email,
          user_type: userType,
        });

        // Create profile based on user type
        setMessage(`Setting up your ${userType} profile...`);
        if (userType === "freelancer") {
          await supabase.from("freelancers").insert({
            user_id: userId,
            full_name: fullName,
            email: data.session.user.email || "",
            title: additionalData.title || "",
            description: additionalData.description || "",
            hourly_rate: Number(additionalData.hourly_rate) || 0,
            languages: [],
            services: [],
            rating: 0,
            reviews_count: 0,
            completed_projects: 0,
            response_time: "Not available",
            avatar_url: null,
            balance: 0,
          });
        } else if (userType === "client") {
          await supabase.from("clients").insert({
            user_id: userId,
            company_name: additionalData.company_name || "",
            contact_name: fullName,
            contact_email: data.session.user.email || "",
            balance: 0,
          });
        }

        setMessage("Account setup complete! Redirecting you to login...");

        // Redirect to login page after successful setup
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 2000);
      } catch (err: any) {
        console.error("Error setting up user:", err);
        setError(err.message || "An error occurred during account setup");
      }
    };

    setupUser();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Account Setup</h1>

        {error ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4">{message}</p>
            <div className="mt-4 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
