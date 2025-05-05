"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function ProjectPage() {
  const searchParams = useSearchParams();
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    service_type: "dubbing", // Changed default to dubbing
    budget: "",
    language_from: "English",
    language_to: "Spanish",
    duration: "1-5", // In minutes
    content_type: "video",
  });
  const [freelancerId, setFreelancerId] = useState("");
  const [clientId, setClientId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Background animation properties
  const waveVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror" as const,
      },
    },
  };

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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
        language_from: projectData.language_from,
        language_to: projectData.language_to,
        duration: projectData.duration,
        content_type: projectData.content_type,
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
      // Reset form on successful submission
      setProjectData({
        title: "",
        description: "",
        service_type: "dubbing",
        budget: "",
        language_from: "English",
        language_to: "Spanish",
        duration: "1-5",
        content_type: "video",
      });
      setCurrentStep(1);
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
      case "voiceover":
        return "🎙️";
      case "dubbing":
        return "🎬";
      case "translator":
        return "🌐";
      default:
        return "🔊";
    }
  };

  // Service-specific descriptions
  const getServiceDescription = (type: string) => {
    switch (type) {
      case "voiceover":
        return "Professional narration for your content";
      case "dubbing":
        return "Replace original audio with translated dialogue";
      case "translator":
        return "Written translation of your scripts or subtitles";
      default:
        return "Select a service type";
    }
  };

  // Languages list
  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Japanese",
    "Korean",
    "Chinese",
    "Russian",
    "Arabic",
    "Hindi",
  ];

  // Render form steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-medium text-purple-800">
              Step 1: Basic Information
            </h2>

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
                placeholder="e.g. Corporate Training Video Dubbing"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
              <div className="mt-1 grid grid-cols-3 gap-3">
                {["voiceover", "dubbing", "translator"].map((type) => (
                  <div
                    key={type}
                    onClick={() =>
                      setProjectData({ ...projectData, service_type: type })
                    }
                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center transition-all ${
                      projectData.service_type === type
                        ? "border-purple-500 bg-purple-50 shadow-md"
                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    <span className="text-3xl mb-2">
                      {getServiceIcon(type)}
                    </span>
                    <h3 className="font-medium capitalize">{type}</h3>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      {getServiceDescription(type)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="content_type"
                className="block text-sm font-medium text-gray-700"
              >
                Content Type
              </label>
              <select
                id="content_type"
                name="content_type"
                value={projectData.content_type}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="video">Video Content</option>
                <option value="audio">Audio Only</option>
                <option value="podcast">Podcast</option>
                <option value="commercial">Commercial</option>
                <option value="film">Film/Movie</option>
                <option value="elearning">E-Learning</option>
                <option value="audiobook">Audiobook</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={nextStep}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Next Step
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-medium text-purple-800">
              Step 2: Language & Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="language_from"
                  className="block text-sm font-medium text-gray-700"
                >
                  Source Language
                </label>
                <select
                  id="language_from"
                  name="language_from"
                  value={projectData.language_from}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {languages.map((lang) => (
                    <option key={`from-${lang}`} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="language_to"
                  className="block text-sm font-medium text-gray-700"
                >
                  Target Language
                </label>
                <select
                  id="language_to"
                  name="language_to"
                  value={projectData.language_to}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {languages.map((lang) => (
                    <option key={`to-${lang}`} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Content Duration (minutes)
              </label>
              <select
                id="duration"
                name="duration"
                value={projectData.duration}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="1-5">1-5 minutes</option>
                <option value="5-15">5-15 minutes</option>
                <option value="15-30">15-30 minutes</option>
                <option value="30-60">30-60 minutes</option>
                <option value="60+">60+ minutes</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                This helps us estimate the project scope and timeline.
              </p>
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
                  placeholder="Please describe your project requirements, target audience, preferred voice style/tone, and any specific instructions..."
                  rows={6}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                ></textarea>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Include details like script availability, reference materials,
                or style preferences.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center justify-center py-3 px-6 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Next
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-medium text-purple-800">
              Step 3: Budget & Finalize
            </h2>

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
                  className="block w-full pl-8 border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="mt-4 bg-purple-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-purple-800">
                  Budget Guidelines
                </h3>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>Voiceover: $100-300 per finished minute</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>Dubbing: $250-500 per finished minute</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>Translation: $0.10-0.25 per word</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">
                Project Summary
              </h3>
              <dl className="mt-2 divide-y divide-gray-200">
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Service</dt>
                  <dd className="text-sm font-medium text-gray-900 capitalize">
                    {projectData.service_type}
                  </dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Content Type
                  </dt>
                  <dd className="text-sm font-medium text-gray-900 capitalize">
                    {projectData.content_type}
                  </dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Languages
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {projectData.language_from} → {projectData.language_to}
                  </dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Duration
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {projectData.duration} minutes
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center justify-center py-3 px-6 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back
              </button>
              <button
                type="submit"
                className="flex items-center justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                  <>
                    Create Project
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            variants={waveVariants}
            animate="animate"
            className="absolute opacity-10"
            style={{
              left: `${i * 20}%`,
              top: `${(i * 15) % 100}%`,
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(139,92,246,0.8) 0%, rgba(139,92,246,0) 70%)`,
              filter: "blur(40px)",
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}

        {/* Audio wave animation */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: [15, 40, 15],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatType: "mirror",
                delay: i * 0.05,
              }}
              className="w-2 mx-1 bg-purple-500 rounded-full"
              style={{ height: 15 }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[...Array(totalSteps)].map((_, idx) => (
              <div key={idx} className="flex items-center">
                <div
                  className={`rounded-full transition-colors flex items-center justify-center
                    ${
                      idx + 1 <= currentStep
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }
                    ${
                      idx + 1 === currentStep
                        ? "h-10 w-10 shadow-md"
                        : "h-8 w-8"
                    }
                  `}
                >
                  {idx + 1 < currentStep ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < totalSteps - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      idx + 1 < currentStep ? "bg-purple-600" : "bg-gray-200"
                    }`}
                    style={{ width: "100px" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm font-medium text-gray-600">
              Basic Info
            </span>
            <span className="text-sm font-medium text-gray-600">Details</span>
            <span className="text-sm font-medium text-gray-600">
              Budget & Review
            </span>
          </div>
        </div>

        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-8 text-white relative">
            <div className="absolute right-0 top-0 h-full opacity-20">
              {projectData.service_type === "voiceover" && (
                <svg
                  width="200"
                  height="100%"
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M80 30v140M100 50v100M120 70v60"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {projectData.service_type === "dubbing" && (
                <svg
                  width="200"
                  height="100%"
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M60 100h30M100 60v80M120 80v40M150 100h-30"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {projectData.service_type === "translator" && (
                <svg
                  width="200"
                  height="100%"
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M60 70h80M60 100h60M60 130h40M140 70v60"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Create New Project
            </h1>
            <p className="mt-3 text-purple-100 max-w-xl">
              Define your {projectData.service_type} project details and connect
              with professional talent in our network
            </p>

            <div className="flex items-center mt-6">
              <span className="text-3xl mr-4">
                {getServiceIcon(projectData.service_type)}
              </span>
              <div>
                <p className="font-semibold text-lg capitalize">
                  {projectData.service_type} Service
                </p>
                <p className="text-purple-100 text-sm">
                  {getServiceDescription(projectData.service_type)}
                </p>
              </div>
            </div>
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
                    <span className="ml-1">Talent #{freelancerId}</span>
                  )}
                  {freelancerId && clientId && <span className="mx-1">•</span>}
                  {clientId && <span>Client #{clientId}</span>}
                </p>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md"
            >
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
            </motion.div>
          )}

          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md"
            >
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
                    <span className="font-bold">Success!</span> Your project has
                    been created. Our talent will be notified and will contact
                    you shortly.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form Section */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit}>{renderStep()}</form>
          </div>
        </motion.div>

        {/* Media platform features */}
        <div className="max-w-3xl mx-auto mt-12 grid grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-100 text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <span className="text-xl">🔍</span>
            </div>
            <h3 className="mt-3 font-medium text-gray-900">Quality Talent</h3>
            <p className="mt-1 text-sm text-gray-500">
              Verified professionals with experience in audio production
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-100 text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <span className="text-xl">🔒</span>
            </div>
            <h3 className="mt-3 font-medium text-gray-900">Secure Payments</h3>
            <p className="mt-1 text-sm text-gray-500">
              Pay only when you're completely satisfied with the work
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-100 text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="mt-3 font-medium text-gray-900">Fast Delivery</h3>
            <p className="mt-1 text-sm text-gray-500">
              Quick turnaround times with professional results
            </p>
          </div>
        </div>

        {/* Footer help text */}
        <div className="max-w-3xl mx-auto mt-8 text-center text-sm text-gray-500">
          <p>
            Need help? Our audio production specialists are ready to assist you
            at{" "}
            <span className="text-purple-600 font-medium">
              support@voicetalent.com
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
