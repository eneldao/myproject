"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ProjectPage() {
  const searchParams = useSearchParams();
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    service_type: "design", // Changed to match backend field name
    budget: "",
  });
  const [freelancerId, setFreelancerId] = useState("");
  const [clientId, setClientId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Get the full URL path
    const fullPath = window.location.href;

    // Extract the IDs from the URL
    const pathParts = fullPath.split("/projects/");
    if (pathParts.length > 1) {
      const ids = pathParts[1].split("&");
      if (ids.length >= 2) {
        setFreelancerId(ids[0]);
        setClientId(ids[1]);
      }
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      // Validate budget is a number
      const numericBudget = parseFloat(projectData.budget);
      if (isNaN(numericBudget)) {
        throw new Error("Budget must be a valid number");
      }

      // Prepare the request body to match backend expectations
      const requestBody = {
        title: projectData.title,
        description: projectData.description,
        service_type: projectData.service_type,
        budget: numericBudget,
        freelancer_id: freelancerId,
        client_id: clientId,
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      setSubmitSuccess(true);
      // Reset form on successful submission if desired
      setProjectData({
        title: "",
        description: "",
        service_type: "design",
        budget: "",
      });
    } catch (error) {
      console.error("Error submitting project:", error);
      setSubmitError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine service type icon
  const getServiceIcon = (type: string) => {
    switch (type) {
      case "design":
        return "✏️";
      case "development":
        return "💻";
      case "marketing":
        return "📊";
      default:
        return "🔧";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Project
          </h1>
          <p className="mt-2 text-blue-100">
            Define your project details to get started with your freelancer
          </p>
        </div>

        {/* Connection Info Card */}
        {(freelancerId || clientId) && (
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mx-6 mt-6 rounded-md flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-indigo-800">
                <span className="font-medium">Connection established:</span>
                {freelancerId && (
                  <span className="ml-1">Freelancer #{freelancerId}</span>
                )}
                {freelancerId && clientId && <span className="mx-1">•</span>}
                {clientId && <span>Client #{clientId}</span>}
              </p>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {submitError && (
          <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {submitSuccess && (
          <div className="mx-6 mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Project created successfully! Your freelancer will be
                  notified.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Project Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={projectData.title}
                onChange={handleInputChange}
                placeholder="e.g. Dubbing design for Small Business"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="service_type"
                className="block text-sm font-medium text-gray-700"
              >
                Service Type
              </label>
              <div className="mt-1 relative">
                <select
                  id="service_type"
                  name="service_type"
                  value={projectData.service_type}
                  onChange={handleInputChange}
                  className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="voiceover">Voiceover</option>
                  <option value="dubbing">Dubbing</option>
                  <option value="translator">Translator</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-lg">
                    {getServiceIcon(projectData.service_type)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-medium text-gray-700"
              >
                Budget (USD)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={projectData.budget}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="block w-full pl-8 border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Project Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  value={projectData.description}
                  onChange={handleInputChange}
                  placeholder="Please describe your project requirements, goals, and timeline..."
                  rows={6}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Be specific to help your freelancer understand your needs.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Create Project"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer help text */}
      <div className="max-w-3xl mx-auto mt-6 text-center text-sm text-gray-500">
        <p>
          Need help? Contact support for assistance with creating your project.
        </p>
      </div>
    </div>
  );
}
