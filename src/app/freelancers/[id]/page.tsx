"use client";
export const revalidate = 0;
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Freelancer, Project, ProjectMessage } from "@/lib/types";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function FreelancerProfile() {
  const params = useParams();
  const router = useRouter();
  const freelancerId = params?.id as string;

  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For project messages
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // For status updates
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{
    projectId: string;
    status: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add this flag to control refetching
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Add this to create a data refresh counter
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Modify the fetchFreelancerData function to be reusable
  // Modified fetchFreelancerData to preserve selected project after refresh
  const fetchFreelancerData = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to avoid browser caching
      const response = await fetch(
        `/api/freelancers/${freelancerId}?t=${new Date().getTime()}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setFreelancer(data.freelancer);
      setProjects(data.projects || []);

      // If there's a selected project, find it in the updated projects list
      if (selectedProject) {
        const updatedSelectedProject = data.projects.find(
          (p: Project) => p.id === selectedProject.id
        );

        // If found, update the selected project with fresh data
        if (updatedSelectedProject) {
          setSelectedProject(updatedSelectedProject);
        }
        // If not found and there are projects, select the first one
        else if (data.projects && data.projects.length > 0) {
          setSelectedProject(data.projects[0]);
        }
      }
      // If no project is selected and there are projects, select the first one
      else if (data.projects && data.projects.length > 0) {
        setSelectedProject(data.projects[0]);
      }

      // Reset refetch flag
      setShouldRefetch(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Failed to fetch freelancer data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to directly fetch a specific project
  const fetchProjectById = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const updatedProject = await response.json();

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId ? updatedProject : project
        )
      );

      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(updatedProject);
      }
    } catch (err) {
      console.error("Failed to fetch updated project:", err);
    }
  };

  useEffect(() => {
    if (freelancerId) {
      fetchFreelancerData();
    }
  }, [freelancerId, shouldRefetch, refreshCounter]);

  // Fetch messages when a project is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedProject) return;

      try {
        const response = await fetch(
          `/api/messages?project_id=${selectedProject.id}`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setMessages(data || []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [selectedProject]);

  // Show success message temporarily
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handler for sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject || !newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const messageData = {
        project_id: selectedProject.id,
        sender_id: freelancerId,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
      };

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Add the new message to the list
      setMessages([...messages, data[0]]);
      setNewMessage("");

      // Optionally refresh data after sending message
      // setShouldRefetch(true);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Handler for updating project status
  // Modified handleUpdateProjectStatus to force a full refresh after status update
  const handleUpdateProjectStatus = async (
    projectId: string,
    status: string
  ) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        cache: "no-store", // Ensure no caching
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const updatedProject = await response.json();

      // Update the projects list with the server's response
      setProjects(
        projects.map((project) =>
          project.id === projectId ? updatedProject : project
        )
      );

      // If the updated project is the selected project, update it as well
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(updatedProject);
      }

      // Show success message
      setSuccessMessage(`Project status updated to ${status}`);

      // Force a full refresh after a small delay to ensure DB has settled
      setTimeout(() => {
        setRefreshCounter((prev) => prev + 1);
      }, 300);
    } catch (err) {
      console.error("Failed to update project status:", err);
      alert("Failed to update project status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Handler for accepting a project
  const handleAcceptProject = (projectId: string) => {
    handleUpdateProjectStatus(projectId, "in_progress");
  };

  // Handler for declining a project
  const handleDeclineProject = (projectId: string) => {
    handleUpdateProjectStatus(projectId, "declined");
  };

  // Handler for marking a project as completed
  const handleCompleteProject = (projectId: string) => {
    handleUpdateProjectStatus(projectId, "completed");
  };

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function for time format
  const formatTime = (dateString?: string) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color classes
  const getStatusClasses = (status?: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "declined":
        return "bg-red-100 text-red-800 border-red-200";
      case "paid":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Add this helper function near other helper functions
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-blue-500 to-indigo-500",
      "from-emerald-500 to-teal-500",
      "from-purple-500 to-pink-500",
      "from-amber-500 to-orange-500",
      "from-rose-500 to-red-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-xl text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-red-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Error</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-yellow-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Freelancer Not Found
          </h1>
          <p className="mt-2 text-gray-600">
            We couldn't find the freelancer you're looking for.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 py-10 relative">
      <AnimatedBackground />
      <div className="container mx-auto px-4 relative z-10">
        {/* Success Message Toast */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md transition-opacity duration-500 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Freelancer Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 flex flex-col items-center md:items-start md:pr-8 md:border-r border-gray-200">
              {/* Enhanced Avatar with fallback */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0 mb-4 shadow-md border-2 border-white transition-transform duration-300 transform group-hover:scale-105">
                  {freelancer.avatar_url ? (
                    <img
                      src={freelancer.avatar_url}
                      alt={freelancer.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          freelancer.full_name
                        )}&background=random&color=fff&size=128&bold=true`;
                      }}
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getAvatarColor(
                        freelancer.full_name
                      )} text-white text-2xl font-bold`}
                    >
                      {getInitials(freelancer.full_name)}
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Profile Info */}
              <h1 className="text-3xl font-bold text-gray-800 text-center md:text-left mb-2">
                {freelancer.full_name}
              </h1>
              <p className="text-blue-600 font-medium text-lg mb-4 text-center md:text-left">
                {freelancer.title || "Freelance Professional"}
              </p>

              {/* Stats Grid with Balance */}
              <div className="w-full mt-4 grid grid-cols-2 gap-x-4 gap-y-6">
                <div className="col-span-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-4 text-white transform transition-all duration-300 hover:scale-105">
                  <p className="text-sm opacity-90">Available Balance</p>
                  <p className="font-bold text-2xl">
                    ${freelancer.balance || "0.00"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 transform transition-all duration-300 hover:bg-gray-100">
                  <p className="text-sm text-gray-500">Hourly Rate</p>
                  <p className="font-semibold text-gray-900">
                    ${freelancer.hourly_rate || "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 transform transition-all duration-300 hover:bg-gray-100">
                  <p className="text-sm text-gray-500">Rating</p>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900 mr-1">
                      {freelancer.rating || "N/A"}
                    </span>
                    {freelancer.rating && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-yellow-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 transform transition-all duration-300 hover:bg-gray-100">
                  <p className="text-sm text-gray-500">Projects Done</p>
                  <p className="font-semibold text-gray-900">
                    {freelancer.completed_projects || 0}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 transform transition-all duration-300 hover:bg-gray-100">
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="font-semibold text-gray-900">
                    {freelancer.response_time || "N/A"}
                  </p>
                </div>
              </div>

              {/* Enhanced Contact Button */}
              <div className="w-full mt-8">
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  Contact {freelancer.full_name.split(" ")[0]}
                </button>
              </div>
            </div>

            <div className="md:w-2/3 mt-8 md:mt-0 md:pl-8">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                  About
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {freelancer.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Skills Section */}
                {freelancer.skills && freelancer.skills.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-blue-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                        />
                      </svg>
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {freelancer.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Section */}
                {freelancer.services && freelancer.services.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-blue-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                        />
                      </svg>
                      Services
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {freelancer.services.map((service, index) => (
                        <span
                          key={index}
                          className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages Section */}
                {freelancer.languages && freelancer.languages.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-blue-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
                        />
                      </svg>
                      Languages
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {freelancer.languages.map((language, index) => (
                        <span
                          key={index}
                          className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Projects and Messages Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                  />
                </svg>
                Projects
              </h2>
            </div>

            <div className="p-5 max-h-[600px] overflow-y-auto">
              {projects.length === 0 ? (
                <div className="text-center py-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="w-16 h-16 mx-auto text-gray-300 mb-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  <p className="text-gray-500 font-medium">No projects found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    This freelancer has no active projects
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`border rounded-xl p-4 hover:bg-gray-50 transition cursor-pointer ${
                        selectedProject?.id === project.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800">
                          {project.title}
                        </h3>
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusClasses(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {project.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4 mr-1"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.732 6.232a2.5 2.5 0 013.536 0 2.5 2.5 0 010 3.536L8.732 13.304a.75.75 0 11-1.06-1.06l3.536-3.536a1 1 0 000-1.416 1 1 0 00-1.416 0L6.5 10.586a.75.75 0 01-1.06-1.06l3.292-3.294zM12.5 9.5a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          ${project.budget || 0}
                        </div>
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4 mr-1"
                          >
                            <path d="M5.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V12zM6 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H6zM7.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H8a.75.75 0 01-.75-.75V12zM8 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H8zM9.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V10zM10 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H10zM9.25 14a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V14zM12 9.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V10a.75.75 0 00-.75-.75H12zM11.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V12zM12 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H12zM13.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H14a.75.75 0 01-.75-.75V10zM14 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H14z" />
                            <path
                              fillRule="evenodd"
                              d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {formatDate(project.created_at)}
                        </div>
                      </div>

                      {project.status === "pending" && (
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptProject(project.id);
                            }}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition flex items-center disabled:opacity-70"
                            disabled={updating}
                          >
                            {updating ? (
                              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4 mr-1"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4.5 12.75l6 6 9-13.5"
                                />
                              </svg>
                            )}
                            Accept
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeclineProject(project.id);
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition flex items-center disabled:opacity-70"
                            disabled={updating}
                          >
                            {updating ? (
                              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4 mr-1"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            )}
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Project Details and Messages */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
            {selectedProject ? (
              <>
                <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      {selectedProject.title}
                    </h2>
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusClasses(
                        selectedProject.status
                      )}`}
                    >
                      {selectedProject.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">
                      Project Details
                    </h3>
                    <p className="text-gray-700 mb-4">
                      {selectedProject.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Budget</p>
                        <p className="font-semibold text-gray-900">
                          ${selectedProject.budget}
                        </p>
                      </div>

                      {selectedProject.service_type && (
                        <div>
                          <p className="text-xs text-gray-500">Service</p>
                          <p className="font-semibold text-gray-900">
                            {selectedProject.service_type}
                          </p>
                        </div>
                      )}

                      {selectedProject.start_date && (
                        <div>
                          <p className="text-xs text-gray-500">Start Date</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(selectedProject.start_date)}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(selectedProject.created_at)}
                        </p>
                      </div>
                    </div>

                    {selectedProject.status === "pending" && (
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            handleAcceptProject(selectedProject.id)
                          }
                          disabled={updating}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center disabled:opacity-70"
                        >
                          {updating ? (
                            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5 mr-2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                          )}
                          Accept Project
                        </button>
                        <button
                          onClick={() =>
                            handleDeclineProject(selectedProject.id)
                          }
                          disabled={updating}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center disabled:opacity-70"
                        >
                          {updating ? (
                            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5 mr-2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          Decline Project
                        </button>
                      </div>
                    )}

                    {selectedProject.status === "in_progress" && (
                      <div className="mt-6">
                        <button
                          onClick={() =>
                            handleCompleteProject(selectedProject.id)
                          }
                          disabled={updating}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-70"
                        >
                          {updating ? (
                            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5 mr-2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          )}
                          Mark as Completed
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Messages Section */}
                  <div className="border-t pt-5">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-blue-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                        />
                      </svg>
                      Project Messssages
                    </h3>

                    <div className="bg-gray-50 rounded-xl p-4 h-80 overflow-y-auto mb-4 border border-gray-100">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1}
                            stroke="currentColor"
                            className="w-12 h-12 text-gray-300 mb-2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                            />
                          </svg>
                          <p className="text-gray-500 font-medium">
                            No messages yet
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Start the conversation with your client
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`max-w-[75%] ${
                                message.sender_id === freelancerId
                                  ? "ml-auto"
                                  : ""
                              }`}
                            >
                              <div
                                className={`p-3 rounded-2xl ${
                                  message.sender_id === freelancerId
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-gray-200 text-gray-800 rounded-tl-none"
                                }`}
                              >
                                <p>{message.content}</p>
                              </div>
                              <div
                                className={`text-xs mt-1 ${
                                  message.sender_id === freelancerId
                                    ? "text-right text-gray-500"
                                    : "text-gray-500"
                                }`}
                              >
                                {message.sender_id === freelancerId
                                  ? "You"
                                  : "Client"}{" "}
                                • {formatTime(message.created_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSendMessage}>
                      <div className="flex">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={
                            selectedProject.status === "declined" ||
                            sendingMessage
                          }
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition flex items-center disabled:bg-blue-400"
                          disabled={
                            !newMessage.trim() ||
                            selectedProject.status === "declined" ||
                            sendingMessage
                          }
                        >
                          {sendingMessage ? (
                            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5 mr-2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                              />
                            </svg>
                          )}
                          Send
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 h-full text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="w-16 h-16 text-gray-300 mb-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Project Selected
                </h3>
                <p className="text-gray-500 max-w-md">
                  Select a project from the list to view details and messages
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
