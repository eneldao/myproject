"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; // Make sure this import path is correct

// This is a client component that will be used in the app/projects/[id]/page.tsx file
export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth(); // Get the current user from auth context

  // Parse the URL parameter - format should be "freelancerId&clientId"
  const [freelancerId, clientId] = params.id
    ? params.id.split("&")
    : [null, null];

  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    service_type: "",
    budget: 0,
  });

  interface Freelancer {
    id: string;
    full_name?: string;
    email?: string;
    // Add other properties as needed
  }

  interface Client {
    id: string;
    company_name?: string;
    contact_name?: string;
    // Add other properties as needed
  }

  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancerAndClient = async () => {
      try {
        setLoading(true);

        if (!freelancerId || !clientId) {
          setError("Invalid URL parameters");
          setLoading(false);
          return;
        }

        console.log("Fetching data for:", { freelancerId, clientId });

        // Fetch freelancer data
        const freelancerResponse = await fetch(
          `/api/freelancers/${freelancerId}`
        );
        if (!freelancerResponse.ok) {
          throw new Error("Failed to fetch freelancer data");
        }
        const freelancerData = await freelancerResponse.json();
        setFreelancer(freelancerData);

        // Fetch client data
        const clientResponse = await fetch(`/api/clients/${clientId}`);
        if (!clientResponse.ok) {
          throw new Error("Failed to fetch client data");
        }
        const clientData = await clientResponse.json();
        setClient(clientData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerAndClient();
  }, [freelancerId, clientId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({
      ...prev,
      [name]: name === "budget" ? parseFloat(value) : value,
    }));
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!freelancer || !client) {
        setError("Freelancer or client data is missing");
        return;
      }

      // Create a new project with freelancer and client IDs
      const projectData = {
        ...projectForm,
        freelancer_id: freelancer.id,
        client_id: client.id,
        status: "pending", // Default status for new projects
        start_date: new Date().toISOString().split("T")[0], // Current date as start date
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const newProject = await response.json();
      console.log("Project created successfully:", newProject);

      // Redirect to the project detail page
      router.push(`/projects/${newProject.id}`);
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-xl font-semibold mb-4">Error</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Create New Project
          </h1>

          {freelancer && client && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700">
                <span className="font-semibold">Freelancer:</span>{" "}
                {freelancer.full_name || freelancer.id}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Client:</span>{" "}
                {client.company_name || ""}{" "}
                {client.contact_name ? `- ${client.contact_name}` : client.id}
              </p>
            </div>
          )}

          <form onSubmit={handleCreateProject}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="title"
              >
                Project Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={projectForm.title}
                onChange={handleInputChange}
                placeholder="Enter project title"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="service_type"
              >
                Service Type
              </label>
              <select
                id="service_type"
                name="service_type"
                value={projectForm.service_type}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select a service type</option>
                <option value="dubbing">Dubbing</option>
                <option value="transcription">Transcription</option>
                <option value="voice-over">Voice-over</option>
                <option value="web-development">Web Development</option>
                <option value="ui-design">UI Design</option>
              </select>
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="budget"
              >
                Budget ($)
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={projectForm.budget}
                onChange={handleInputChange}
                min="0"
                step="1"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="description"
              >
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                value={projectForm.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Describe your project requirements"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="mr-4 bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#00BFFF] text-white py-2 px-6 rounded-md hover:bg-[#0099CC] transition-colors"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
