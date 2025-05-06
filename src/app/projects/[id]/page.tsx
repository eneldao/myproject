"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0 },
};

const formItemVariants = {
  initial: { y: 20, opacity: 0 },
  animate: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

// Service type icons & illustrations
const serviceIcons = {
  voiceover: "/images/microphone-icon.svg", // You'll need to create or source these SVG icons
  dubbing: "/images/dubbing-icon.svg",
  translator: "/images/translate-icon.svg",
};

export default function ProjectPage() {
  const searchParams = useSearchParams();
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    service_type: "voiceover",
    budget: "",
  });
  const [freelancerId, setFreelancerId] = useState("");
  const [clientId, setClientId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Form steps
  const formSteps = [
    { name: "Basic Info", fields: ["title", "service_type"] },
    { name: "Budget & Details", fields: ["budget", "description"] },
    { name: "Review & Submit", fields: [] },
  ];

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
    if (activeStep < formSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
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
        service_type: "voiceover",
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

  // Service illustration based on selected type
  const getServiceIllustration = () => {
    switch (projectData.service_type) {
      case "voiceover":
        return (
          <div className="relative h-32 w-full">
            <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center">
              <motion.div
                className="w-2 h-10 bg-purple-500 rounded-full mx-1"
                animate={{
                  height: [10, 40, 20, 30, 10],
                  transition: { repeat: Infinity, duration: 1.5 },
                }}
              />
              <motion.div
                className="w-2 h-20 bg-purple-500 rounded-full mx-1"
                animate={{
                  height: [20, 10, 40, 15, 20],
                  transition: { repeat: Infinity, duration: 1.2, delay: 0.2 },
                }}
              />
              <motion.div
                className="w-2 h-15 bg-purple-500 rounded-full mx-1"
                animate={{
                  height: [15, 30, 10, 35, 15],
                  transition: { repeat: Infinity, duration: 1, delay: 0.3 },
                }}
              />
              <motion.div
                className="w-2 h-25 bg-purple-500 rounded-full mx-1"
                animate={{
                  height: [25, 5, 35, 15, 25],
                  transition: { repeat: Infinity, duration: 1.3, delay: 0.5 },
                }}
              />
              <motion.div
                className="w-2 h-18 bg-purple-500 rounded-full mx-1"
                animate={{
                  height: [18, 40, 10, 30, 18],
                  transition: { repeat: Infinity, duration: 1.1, delay: 0.1 },
                }}
              />
            </div>
          </div>
        );
      case "dubbing":
        return (
          <div className="relative h-32 w-full">
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-600 rounded-full opacity-30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  fill="#4F46E5"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <motion.path
                  d="M19.9393 13C19.432 14.9361 18.3147 16.6681 16.7669 17.9083C15.2191 19.1486 13.3099 19.8217 11.3407 19.8218C9.37146 19.822 7.46226 19.1491 5.91431 17.909C4.36635 16.6689 3.2489 14.937 2.74138 13.001C2.23385 11.065 2.31839 9.01913 2.98406 7.13732C3.64973 5.25551 4.86383 3.63399 6.45653 2.47301C8.04922 1.31203 9.93656 0.66925 11.885 0.644551C13.8334 0.619853 15.7352 1.2142 17.3556 2.3495"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{
                    rotate: [0, 360],
                    pathLength: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    rotate: { repeat: Infinity, duration: 8 },
                    pathLength: { repeat: Infinity, duration: 2 },
                  }}
                />
                <motion.path
                  d="M20 7V2M20 2L15 2M20 2L13 9"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{ scale: [1, 0.9, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </svg>
            </motion.div>
          </div>
        );
      case "translator":
        return (
          <div className="relative h-32 w-full flex items-center justify-center">
            <motion.div
              className="flex items-center space-x-2"
              animate={{ x: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <div className="text-blue-500 text-lg font-bold">EN</div>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 7H17M17 7L13 3M17 7L13 11M17 17H7M7 17L11 13M7 17L11 21"
                    stroke="#4F46E5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
              <div className="text-blue-500 text-lg font-bold">ES</div>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  };

  // Background animation elements
  const BackgroundElements = () => (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-blue-300/20 to-purple-300/20 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-gradient-to-r from-indigo-300/20 to-pink-300/20 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-300/10 to-teal-300/10 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
      />
    </div>
  );

  // Progress bar component
  const ProgressBar = () => (
    <div className="w-full bg-gray-100 h-1 rounded-full mb-8">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
        initial={{ width: "0%" }}
        animate={{ width: `${((activeStep + 1) / formSteps.length) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <motion.div
              custom={0}
              variants={formItemVariants}
              initial="initial"
              animate="animate"
              className="mb-6"
            >
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={projectData.title}
                onChange={handleInputChange}
                placeholder="e.g. Professional Voiceover for Corporate Video"
                className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                required
              />
            </motion.div>

            <motion.div
              custom={1}
              variants={formItemVariants}
              initial="initial"
              animate="animate"
              className="mb-8"
            >
              <label
                htmlFor="service_type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Service Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                {["voiceover", "dubbing", "translator"].map((type) => (
                  <motion.div
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setProjectData({ ...projectData, service_type: type })
                    }
                    className={`cursor-pointer rounded-xl border-2 ${
                      projectData.service_type === type
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    } p-4 flex flex-col items-center transition-all duration-200`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full ${
                        projectData.service_type === type
                          ? "bg-indigo-100"
                          : "bg-gray-100"
                      } flex items-center justify-center mb-3`}
                    >
                      {type === "voiceover" && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 18.5C15.5899 18.5 18.5 15.5899 18.5 12C18.5 8.41015 15.5899 5.5 12 5.5C8.41015 5.5 5.5 8.41015 5.5 12C5.5 15.5899 8.41015 18.5 12 18.5Z"
                            stroke="#4F46E5"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                            fill="#4F46E5"
                          />
                        </svg>
                      )}
                      {type === "dubbing" && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                            fill="#4F46E5"
                          />
                          <path
                            d="M19.4 15C18.7 16.8 17.3 18.2 15.5 18.9M4 15.5C4.7 17.3 6.2 18.7 8 19.4M4.6 9C5.3 7.2 6.7 5.8 8.5 5.1M15 5.6C16.8 6.3 18.2 7.8 18.9 9.6M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="#4F46E5"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {type === "translator" && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 5H15M9 3V5M10.5 17L8 21M10.5 17L13 21M10.5 17L14 9.5L17.5 17M7 9.5L8 12M12 5L13.5 9.5M17 5H21M17 3V7M15 21L17.5 17M17.5 17L20 21"
                            stroke="#4F46E5"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium capitalize">
                      {type}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        );

      case 1:
        return (
          <>
            <motion.div
              custom={0}
              variants={formItemVariants}
              initial="initial"
              animate="animate"
              className="mb-6"
            >
              <label
                htmlFor="budget"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Budget (USD)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={projectData.budget}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="block w-full pl-10 border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              custom={1}
              variants={formItemVariants}
              initial="initial"
              animate="animate"
              className="mb-6"
            >
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                value={projectData.description}
                onChange={handleInputChange}
                placeholder="Please describe your project requirements, timeline, and any specific instructions..."
                rows={6}
                className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              ></textarea>
              <p className="mt-2 text-sm text-gray-500">
                The more details you provide, the better your freelancer can
                understand your needs.
              </p>
            </motion.div>
          </>
        );

      case 2:
        return (
          <>
            <motion.div
              custom={0}
              variants={formItemVariants}
              initial="initial"
              animate="animate"
              className="mb-8 border border-gray-100 rounded-xl p-6 bg-gray-50"
            >
              <h3 className="text-lg font-semibold mb-4">Project Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Type:</span>
                  <span className="font-medium capitalize">
                    {projectData.service_type}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium">{projectData.title}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium">${projectData.budget}</span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <span className="block text-gray-600 mb-2">Description:</span>
                  <p className="text-gray-800">{projectData.description}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              custom={1}
              variants={formItemVariants}
              initial="initial"
              animate="animate"
              className="mb-4"
            >
              {(freelancerId || clientId) && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
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
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">
                        Connection established:{" "}
                      </span>
                      {freelancerId && <span>Freelancer #{freelancerId}</span>}
                      {freelancerId && clientId && (
                        <span className="mx-1">•</span>
                      )}
                      {clientId && <span>Client #{clientId}</span>}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-white to-indigo-50"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <BackgroundElements />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Create Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Audio Project
            </span>
          </motion.h1>
          <motion.p
            className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Define your {projectData.service_type} project details and connect
            with talent
          </motion.p>
        </div>

        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="px-6 py-8 md:p-10">
            {/* Step indicators */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {formSteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full ${
                        index === activeStep
                          ? "bg-indigo-600 text-white"
                          : index < activeStep
                          ? "bg-indigo-200 text-indigo-800"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {index < activeStep ? (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs mt-2 text-gray-500">
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
              <ProgressBar />
            </div>

            {/* Service illustration */}
            <div className="mb-8">{getServiceIllustration()}</div>

            {/* Form content */}
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>

              {/* Status messages */}
              <AnimatePresence>
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md"
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md"
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
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
                        <motion.p
                          className="text-sm text-green-700"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          Project created successfully! Your freelancer will be
                          notified.
                        </motion.p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-100">
                <motion.button
                  type="button"
                  onClick={prevStep}
                  disabled={activeStep === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-5 py-3 rounded-lg font-medium ${
                    activeStep === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </motion.button>

                {activeStep < formSteps.length - 1 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Continue
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-6 py-3 rounded-lg font-medium text-white ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      </div>
                    ) : (
                      "Create Project"
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </div>
        </motion.div>

        {/* Footer help text */}
        <motion.div
          className="mt-8 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>
            Need assistance?{" "}
            <span className="text-indigo-600 font-medium hover:text-indigo-500 cursor-pointer">
              Contact support
            </span>{" "}
            for help with your project.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
