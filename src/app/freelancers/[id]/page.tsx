"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Freelancer profile page component
export default function FreelancerProfile() {
  const params = useParams();
  const [freelancer, setFreelancer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch freelancer data from Supabase
    async function fetchFreelancerData() {
      try {
        // Check if id is available
        if (!params.id) {
          setError("Freelancer ID not provided");
          setLoading(false);
          return;
        }

        console.log("Fetching freelancer with ID:", params.id);

        // Fetch user profile from profiles table
        const { data, error } = await supabase
          .from("profiles")
          .select("*, portfolio(*)")
          .eq("id", params.id)
          .eq("user_type", "freelancer")
          .single();

        if (error) {
          console.error("Error fetching freelancer:", error);
          setError("Could not find freelancer profile");
          setLoading(false);
          return;
        }

        if (!data) {
          setError("Freelancer profile not found");
          setLoading(false);
          return;
        }

        console.log("Freelancer data:", data);
        setFreelancer(data);
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchFreelancerData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366]">
      <div className="container mx-auto py-10 px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-blue-700 p-6 text-white">
            <h1 className="text-3xl font-bold">{freelancer.full_name}</h1>
            <p className="text-xl mt-2">
              {freelancer.title || "Freelance Professional"}
            </p>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="col-span-1">
                <h2 className="text-2xl font-semibold mb-4">
                  Contact Information
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong>Email:</strong>{" "}
                    {freelancer.contact_email || freelancer.email}
                  </p>
                  {freelancer.phone && (
                    <p>
                      <strong>Phone:</strong> {freelancer.phone}
                    </p>
                  )}
                  {freelancer.location && (
                    <p>
                      <strong>Location:</strong> {freelancer.location}
                    </p>
                  )}
                  {freelancer.hourly_rate && (
                    <p>
                      <strong>Hourly Rate:</strong> ${freelancer.hourly_rate}
                      /hour
                    </p>
                  )}
                </div>
              </div>

              {/* Middle Column - Description */}
              <div className="col-span-2">
                <h2 className="text-2xl font-semibold mb-4">About</h2>
                <div className="prose max-w-none">
                  <p>{freelancer.description || "No description provided."}</p>
                </div>

                {/* Skills Section */}
                {freelancer.skills && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {freelancer.skills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Portfolio Section */}
            {freelancer.portfolio && freelancer.portfolio.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {freelancer.portfolio.map((item: any) => (
                    <div
                      key={item.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Button */}
            <div className="mt-10 flex justify-center">
              <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-200">
                Contact {freelancer.full_name.split(" ")[0]}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
