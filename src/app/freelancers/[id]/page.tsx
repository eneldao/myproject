"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Freelancer, Project, ProjectMessage } from "@/lib/types";

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

  // For status updates
  const [updateStatus, setUpdateStatus] = useState<{
    projectId: string;
    status: string;
  } | null>(null);

  // Fetch freelancer and project data
  useEffect(() => {
    const fetchFreelancerData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/freelancers/${freelancerId}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setFreelancer(data.freelancer);
        setProjects(data.projects || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Failed to fetch freelancer data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (freelancerId) {
      fetchFreelancerData();
    }
  }, [freelancerId]);

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

  // Handler for sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject || !newMessage.trim()) return;

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
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  // Handler for updating project status
  const handleUpdateProjectStatus = async (
    projectId: string,
    status: string
  ) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const updatedProject = await response.json();

      // Update the projects list
      setProjects(
        projects.map((project) =>
          project.id === projectId ? { ...project, status } : project
        )
      );

      // If the updated project is the selected project, update it as well
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject({ ...selectedProject, status });
      }

      alert(`Project status updated to ${status}`);
    } catch (err) {
      console.error("Failed to update project status:", err);
      alert("Failed to update project status. Please try again.");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Freelancer Not Found</h1>
          <p className="mt-2">
            We couldn't find the freelancer you're looking for.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Freelancer Profile Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            {freelancer.avatar_url ? (
              <img
                src={freelancer.avatar_url}
                alt={freelancer.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{freelancer.full_name}</h1>
            <p className="text-gray-600">{freelancer.title || "Freelancer"}</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-500">Hourly Rate</p>
                <p className="font-semibold">
                  ${freelancer.hourly_rate || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-semibold">
                  {freelancer.rating
                    ? `${freelancer.rating}/5 (${freelancer.reviews_count} reviews)`
                    : "No ratings yet"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Projects Completed</p>
                <p className="font-semibold">
                  {freelancer.completed_projects || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <p className="font-semibold">${freelancer.balance || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-gray-600">
            {freelancer.description || "No description provided."}
          </p>
        </div>

        {freelancer.skills && freelancer.skills.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {freelancer.skills.map((skill, index) => (
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

      {/* Projects and Messages Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="md:col-span-1 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">My Projects</h2>

          {projects.length === 0 ? (
            <p className="text-gray-500">No projects found.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`border rounded-lg p-4 cursor-pointer transition hover:bg-gray-50 ${
                    selectedProject?.id === project.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{project.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        project.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : project.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : project.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : project.status === "declined"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="mt-3 text-sm">
                    <p>Budget: ${project.budget}</p>
                    {project.start_date && (
                      <p>
                        Start:{" "}
                        {new Date(project.start_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {project.status === "pending" && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptProject(project.id);
                        }}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeclineProject(project.id);
                        }}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {project.status === "in_progress" && (
                    <div className="mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteProject(project.id);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Details and Messages */}
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          {selectedProject ? (
            <>
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{selectedProject.title}</h2>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      selectedProject.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedProject.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : selectedProject.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : selectedProject.status === "declined"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedProject.status}
                  </span>
                </div>

                <p className="mt-2 text-gray-600">
                  {selectedProject.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Budget</p>
                    <p className="font-semibold">${selectedProject.budget}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Service Type</p>
                    <p className="font-semibold">
                      {selectedProject.service_type}
                    </p>
                  </div>
                  {selectedProject.start_date && (
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-semibold">
                        {new Date(
                          selectedProject.start_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedProject.end_date && (
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="font-semibold">
                        {new Date(
                          selectedProject.end_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {selectedProject.status === "pending" && (
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => handleAcceptProject(selectedProject.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Accept Project
                    </button>
                    <button
                      onClick={() => handleDeclineProject(selectedProject.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Decline Project
                    </button>
                  </div>
                )}

                {selectedProject.status === "in_progress" && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleCompleteProject(selectedProject.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}
              </div>

              {/* Messages Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Messages</h3>

                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-center">
                      No messages yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg max-w-3/4 ${
                            message.sender_id === freelancerId
                              ? "bg-blue-100 ml-auto"
                              : "bg-gray-200"
                          }`}
                        >
                          <p className="text-xs text-gray-500 mb-1">
                            {message.sender_id === freelancerId
                              ? "You"
                              : "Client"}
                            {" · "}
                            {new Date(message.created_at).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                          <p>{message.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="mt-4">
                  <div className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={
                        selectedProject.status === "declined" ||
                        selectedProject.status === "completed"
                      }
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-gray-300"
                      disabled={
                        !newMessage.trim() ||
                        selectedProject.status === "declined" ||
                        selectedProject.status === "completed"
                      }
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">
                Select a project to view details and messages
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
