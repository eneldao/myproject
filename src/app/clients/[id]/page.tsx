"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Freelancer, Client, Project } from "@/lib/types";
// Add missing imports for animations
import { motion, AnimatePresence } from "framer-motion";
import ProjectModal from "@/components/ProjectModal";
import AnimatedBackground from "@/components/AnimatedBackground";
import RefreshIndicator from "@/components/RefreshIndicator";

// Add these helper functions near the top of the file, after imports
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

const getInitials = (name: string = "") => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Enhanced Client interface to include additional fields
interface EnhancedClient extends Client {
  company_name?: string;
  contact_name?: string;
  contact_email?: string;
  balance?: number; // Changed from string to number to match Client interface
  // Use the same type as in the Client interface
  user_type: "freelancer" | "client" | "admin";
}

interface ClientMessagesProps {
  projects: Project[];
  clientId: string;
}

export default function ClientPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const { user } = useAuth();
  const router = useRouter();
  const [clientData, setClientData] = useState<EnhancedClient | null>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFreelancer, setSelectedFreelancer] =
    useState<Freelancer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    minRate: "",
    maxRate: "",
    minRating: "",
    services: [] as string[],
  });
  // In your component where you have your states
  const [messages, setMessages] = useState<
    {
      id: string;
      content: string;
      sender_id: string;
      created_at: string;
      project_id?: string; // Add project_id to support project messages
    }[]
  >([]);
  // error state is already defined on line 20

  const [projects, setProjects] = useState<
    {
      created_at: string | number | Date;
      id: string;
      title: string;
      description: string;
      budget: number;
      status: string;
      freelancer_id?: string; // Add optional freelancer_id property
    }[]
  >([]);

  // Add new state variables for message composition
  const [messageContent, setMessageContent] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "projects" | "messages" | "freelancers"
  >("projects");

  // Add these new state variables
  const [refreshingMessages, setRefreshingMessages] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null
  );

  // Add new state variables for the payment modal
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [processingFunds, setProcessingFunds] = useState(false);
  const [fundError, setFundError] = useState("");
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  // Add animation states
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(true);

  // Add new state variables for the project modal
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedFreelancerForProject, setSelectedFreelancerForProject] =
    useState<string>("");

  // Add refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract unique services from freelancers for filter dropdown
  const allServices = useCallback(() => {
    const servicesSet = new Set<string>();
    freelancers.forEach((freelancer) => {
      freelancer.services?.forEach((service) => {
        servicesSet.add(service);
      });
    });
    return Array.from(servicesSet);
  }, [freelancers]);

  // Fetch data from API
  // Fetch basic client data
  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/clients/${id}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setClientData(data);

      // Fetch freelancers list with error handling
      try {
        const freelancersResponse = await fetch("/api/freelancers").catch(
          (err) => {
            console.error("Network error fetching freelancers:", err);
            throw new Error(
              "Network connection failed while fetching freelancers"
            );
          }
        );

        if (!freelancersResponse.ok) {
          const errorData = await freelancersResponse.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Failed to fetch freelancers: ${freelancersResponse.status}`
          );
        }

        const freelancersData = await freelancersResponse
          .json()
          .catch((err) => {
            console.error("Error parsing freelancers response:", err);
            throw new Error("Invalid freelancer data received from server");
          });

        // Check if the response contains a freelancers array property
        if (
          freelancersData &&
          freelancersData.freelancers &&
          Array.isArray(freelancersData.freelancers)
        ) {
          setFreelancers(freelancersData.freelancers);
          setFilteredFreelancers(freelancersData.freelancers);
        } else if (Array.isArray(freelancersData)) {
          // Fallback to direct array if that's how the API returns data
          setFreelancers(freelancersData);
          setFilteredFreelancers(freelancersData);
        } else {
          console.error(
            "Freelancers data is not in the expected format:",
            freelancersData
          );
          setFreelancers([]);
          setFilteredFreelancers([]);
        }
      } catch (err) {
        console.error("Error fetching freelancers:", err);
        // Ensure arrays are initialized even on error
        setFreelancers([]);
        setFilteredFreelancers([]);
      }
    } catch (err) {
      console.error("Failed to fetch client data:", err);
      setError("Failed to load client information");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch client projects
  const fetchClientProjects = useCallback(async () => {
    if (!id) return;

    try {
      const response = await fetch(`/api/projects?client_id=${id}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Check if the response contains a projects field or is a direct array
      const projectsList = data.projects || data;

      if (Array.isArray(projectsList)) {
        // Sort projects by creation date (newest first)
        const sortedProjects = [...projectsList].sort((a, b) => {
          if (a.created_at && b.created_at) {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          }
          return 0;
        });

        setProjects(sortedProjects);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load client projects");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch messages for the client
  const fetchClientMessages = useCallback(async () => {
    if (!id) return;
    if (!selectedProject) {
      setMessages([]);
      setDebugInfo(
        "No project selected. Please select a project to view messages."
      );
      return;
    }

    try {
      setRefreshingMessages(true);
      setDebugInfo("Fetching messages...");

      // Use the same API endpoint format that works in the freelancer page
      const response = await fetch(
        `/api/messages?project_id=${selectedProject}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response from messages API:", errorData);
        throw new Error(
          errorData.error || `Failed to fetch messages: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Messages API response:", data);

      if (Array.isArray(data)) {
        setMessages(data);
        setDebugInfo(`Successfully retrieved ${data.length} messages`);
      } else if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
        setDebugInfo(`Successfully retrieved ${data.messages.length} messages`);
      } else {
        console.error("Unexpected message data format:", data);
        setMessages([]);
        setDebugInfo(
          "API returned an unexpected data format. No messages found."
        );
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setDebugInfo(
        `Error fetching messages: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      setMessages([]);
    } finally {
      setRefreshingMessages(false);
    }
  }, [id, selectedProject]);

  // Add a function to send a test message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !messageContent.trim()) {
      setMessageError("Please select a project and enter a message");
      return;
    }

    try {
      setSendingMessage(true);
      setMessageError("");

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageContent,
          project_id: selectedProject,
          sender_id: id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to send message: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Message response:", data);

      // Add the new message to the messages state
      if (data[0]) {
        setMessages((prevMessages) => [...prevMessages, data[0]]);
      } else if (data.message) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }

      // Clear the message input
      setMessageContent("");
      setMessageSent(true);

      // Hide the success message after 3 seconds
      setTimeout(() => {
        setMessageSent(false);
      }, 3000);

      // Refresh messages after sending
      setTimeout(() => {
        fetchClientMessages();
      }, 500);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessageError(
        err instanceof Error ? err.message : "Failed to send message"
      );
    } finally {
      setSendingMessage(false);
    }
  };

  // Add a direct refresh function for messages
  const refreshMessages = async () => {
    setDebugInfo("Refreshing messages...");
    await fetchClientMessages();
  };

  // Add a retry handler for the error state
  const handleRetry = () => {
    setError("");
    setLoading(true);

    // Retry both data fetching operations
    Promise.all([
      fetchData().catch((err) => console.error("Retry fetchData failed:", err)),
      fetchClientProjects().catch((err) =>
        console.error("Retry fetchClientProjects failed:", err)
      ),
    ]).finally(() => setLoading(false));
  };

  // Add a function to handle adding funds to client account
  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      setFundError("Please enter a valid amount");
      return;
    }

    setProcessingFunds(true);
    setFundError("");

    try {
      const response = await fetch(`/api/clients/${id}/balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(fundAmount),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add funds");
      }

      const data = await response.json();

      // Update client data with new balance
      if (clientData) {
        setClientData({
          ...clientData,
          balance: data.balance,
        });
      }

      // Close modal and reset form
      setShowAddFundsModal(false);
      setFundAmount("");
      setInsufficientFunds(false);

      // Show success message
      alert(
        `Successfully added $${parseFloat(fundAmount).toFixed(
          2
        )} to your account!`
      );

      // Refresh all data
      await refreshData();
    } catch (error) {
      console.error("Error adding funds:", error);
      setFundError(
        error instanceof Error ? error.message : "Failed to add funds"
      );
    } finally {
      setProcessingFunds(false);
    }
  };

  const handlePayFreelancer = async (project: {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: string;
    freelancer_id?: string; // Make sure freelancer_id is included in the type
  }) => {
    setProcessingPayment(project.id);
    try {
      // Make sure we have the freelancer_id
      if (!project.freelancer_id) {
        throw new Error("Freelancer ID is missing from project data");
      }

      // Check if client has enough balance for this payment
      if (clientData && (clientData.balance || 0) < project.budget) {
        setInsufficientFunds(true);
        setShowAddFundsModal(true);
        throw new Error(
          `Insufficient funds. You need $${project.budget.toFixed(
            2
          )} to complete this payment.`
        );
      }

      // Call the payment API endpoint
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: project.id,
          client_id: id,
          freelancer_id: project.freelancer_id,
          amount: project.budget,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment failed");
      }

      const data = await response.json();

      // Update client balance in the local state
      if (clientData && data.client_balance !== undefined) {
        setClientData({
          ...clientData,
          balance: data.client_balance,
        });
      }

      // Update the project status in the local state
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === project.id ? { ...p, status: "paid" } : p
        )
      );

      // Show payment confirmation with fee information
      alert(
        `Payment for project "${project.title}" processed successfully!\n\n` +
          `Total Amount: $${project.budget.toFixed(2)}\n` +
          `Platform Fee (${data.fee_percentage}%): $${data.platform_fee.toFixed(
            2
          )}\n` +
          `Amount to Freelancer: $${data.amount_to_freelancer.toFixed(2)}`
      );

      // Refresh client data to show updated balance
      fetchData();

      // Refresh all data
      await refreshData();
    } catch (err) {
      console.error("Payment processing error:", err);
      // Only show alert if not related to insufficient funds
      if (!insufficientFunds) {
        alert(
          `Payment failed: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
    } finally {
      setProcessingPayment(null);
    }
  };

  // Add refresh function
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchData(),
        fetchClientProjects(),
        activeTab === "messages" && selectedProject
          ? fetchClientMessages()
          : Promise.resolve(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    fetchData,
    fetchClientProjects,
    fetchClientMessages,
    activeTab,
    selectedProject,
  ]);

  // Update the handleProjectRequest function
  const handleProjectRequest = (freelancerId: string) => {
    setSelectedFreelancerForProject(freelancerId);
    setShowProjectModal(true);
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchData();
    fetchClientProjects();
  }, [fetchData, fetchClientProjects]);

  // Update messages when the selected project changes
  useEffect(() => {
    if (selectedProject) {
      fetchClientMessages();
    }
  }, [selectedProject, fetchClientMessages]);

  // Filter freelancers based on search term and filters
  useEffect(() => {
    if (!freelancers.length) return;

    let results = [...freelancers];

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      results = results.filter(
        (freelancer) =>
          freelancer.full_name?.toLowerCase().includes(lowerCaseSearch) ||
          freelancer.title?.toLowerCase().includes(lowerCaseSearch) ||
          freelancer.description?.toLowerCase().includes(lowerCaseSearch) ||
          freelancer.services?.some((service) =>
            service.toLowerCase().includes(lowerCaseSearch)
          )
      );
    }

    // Apply rate filters
    if (filterOptions.minRate) {
      results = results.filter(
        (freelancer) =>
          (freelancer.hourly_rate || 0) >= Number(filterOptions.minRate)
      );
    }

    if (filterOptions.maxRate) {
      results = results.filter(
        (freelancer) =>
          (freelancer.hourly_rate || 0) <= Number(filterOptions.maxRate)
      );
    }

    // Apply rating filter
    if (filterOptions.minRating) {
      results = results.filter(
        (freelancer) =>
          (freelancer.rating || 0) >= Number(filterOptions.minRating)
      );
    }

    // Apply services filter
    if (filterOptions.services.length > 0) {
      results = results.filter((freelancer) =>
        filterOptions.services.some((service) =>
          freelancer.services?.includes(service)
        )
      );
    }

    setFilteredFreelancers(results);
  }, [freelancers, searchTerm, filterOptions]);

  // Modify activeTab state setter to include animation
  const handleTabChange = (tab: "projects" | "messages" | "freelancers") => {
    setIsTabChanging(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTabChanging(false);
    }, 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-xl text-gray-700">Loading client profile...</p>
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
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  function resetFilters(event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error("Function not implemented.");
  }

  function toggleServiceFilter(service: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 py-10 relative">
      <RefreshIndicator isRefreshing={isRefreshing} />
      <AnimatedBackground />
      <div className="container mx-auto px-4 relative z-10">
        {/* Client Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 flex flex-col items-center md:items-start md:pr-8 md:border-r border-gray-200">
              {/* Client Avatar */}
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0 mb-4 shadow-md border-2 border-white">
                {clientData?.avatar_url ? (
                  <img
                    src={clientData.avatar_url}
                    alt={clientData.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        clientData.full_name
                      )}&background=random&color=fff&size=128&bold=true`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-2xl font-bold">
                    {clientData?.full_name?.charAt(0) || "C"}
                  </div>
                )}
              </div>

              {/* Client Info */}
              <h1 className="text-3xl font-bold text-gray-800 text-center md:text-left">
                {clientData?.company_name || clientData?.full_name}
              </h1>
              <p className="text-blue-600 font-medium text-lg mb-4 text-center md:text-left">
                {clientData?.contact_name || "Client"}
              </p>

              {/* Stats Grid */}
              <div className="w-full mt-4 grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-90">Available Balance</p>
                  <p className="font-bold text-2xl">
                    ${(clientData?.balance || 0).toFixed(2)}
                  </p>
                  <button
                    onClick={() => setShowAddFundsModal(true)}
                    className="mt-2 w-full bg-white/20 hover:bg-white/30 text-white text-sm py-1 px-3 rounded transition-colors"
                  >
                    Add Funds
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="font-semibold text-gray-900">
                    {projects.length}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Active Projects</p>
                  <p className="font-semibold text-gray-900">
                    {projects.filter((p) => p.status === "in_progress").length}
                  </p>
                </div>
              </div>

              {/* Contact Button */}
              <div className="w-full mt-8">
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 inline-block mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Contact Support
                </button>
              </div>
            </div>

            {/* Client Details */}
            <div className="md:w-2/3 mt-8 md:mt-0 md:pl-8">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Overview
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-semibold text-gray-900">
                        {clientData?.company_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Name</p>
                      <p className="font-semibold text-gray-900">
                        {clientData?.contact_name || clientData?.full_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">
                        {clientData?.email || clientData?.contact_email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(
                          clientData?.created_at || ""
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Summary */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Project Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600">Completed Projects</p>
                    <p className="text-2xl font-bold text-green-700">
                      {projects.filter((p) => p.status === "completed").length}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600">Active Projects</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {
                        projects.filter((p) => p.status === "in_progress")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="flex border-b">
            {["projects", "messages", "freelancers"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab as any)}
                className={`flex-1 px-6 py-4 text-center font-medium relative ${
                  activeTab === tab
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    initial={false}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Projects Tab */}
          {activeTab === "projects" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
                  whileHover={{ y: -5 }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-gray-900">
                        {project.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : project.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {project.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        ${project.budget}
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t rounded-b-xl">
                    <div className="flex justify-between items-center">
                      {project.status === "completed" && (
                        <button
                          onClick={() => handlePayFreelancer(project)}
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                          disabled={processingPayment === project.id}
                        >
                          {processingPayment === project.id ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin h-4 w-4 mr-2"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Processing...
                            </span>
                          ) : (
                            "Pay Freelancer"
                          )}
                        </button>
                      )}
                      <Link
                        href={`/projectdetails/${project.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Rest of your tab content */}
          {/* Messages Tab */}
          {activeTab === "messages" && (
            <motion.div
              key="messages"
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Project Messages
              </h2>

              {/* Selected Freelancer Section (if applicable) */}
              {selectedFreelancer && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {selectedFreelancer.avatar_url ? (
                        <img
                          src={selectedFreelancer.avatar_url}
                          alt={`${selectedFreelancer.full_name}'s avatar`}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                          <span className="text-gray-600 font-medium">
                            {selectedFreelancer.full_name?.charAt(0) || "F"}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {selectedFreelancer.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedFreelancer.title}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFreelancer(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Project Selector */}
              <div className="mb-4">
                <label
                  htmlFor="project-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Project
                </label>
                <select
                  id="project-select"
                  className="w-full border rounded-md p-2"
                  value={selectedProject || ""}
                  onChange={(e) => {
                    const projectId = e.target.value;
                    setSelectedProject(projectId);
                    if (projectId) {
                      setDebugInfo("Project selected, loading messages...");
                    } else {
                      setMessages([]);
                      setDebugInfo("No project selected.");
                    }
                  }}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} - {project.status}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProject ? (
                <>
                  {/* Message Display */}
                  <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
                    {/* Debug info to check message data */}
                    <div className="text-xs text-gray-400 mb-2 flex justify-between items-center">
                      <span>Total messages: {messages.length}</span>
                      <button
                        onClick={refreshMessages}
                        disabled={refreshingMessages}
                        className="text-blue-500 hover:text-blue-700"
                        title="Refresh messages"
                      >
                        {refreshingMessages ? "Refreshing..." : "↻ Refresh"}
                      </button>
                    </div>

                    {messages.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500 mb-2">
                          No messages yet for this project.
                        </p>

                        {debugInfo && (
                          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded mb-4 text-left">
                            <strong>Debug info:</strong> {debugInfo}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg max-w-3/4 ${
                              message.sender_id === id
                                ? "bg-blue-100 ml-auto"
                                : "bg-gray-200"
                            }`}
                          >
                            <p className="text-xs text-gray-500 mb-1">
                              {message.sender_id === id ? "You" : "Freelancer"}
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

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="mt-4">
                    <div className="flex flex-col space-y-2">
                      <textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="w-full border rounded-md p-2 min-h-[100px]"
                        placeholder="Type your message..."
                        required
                      />

                      {messageError && (
                        <div className="text-red-500 text-sm">
                          {messageError}
                        </div>
                      )}

                      {messageSent && (
                        <div className="text-green-500 text-sm">
                          Message sent successfully!
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={sendingMessage}
                          className={`bg-[#00BFFF] text-white py-2 px-6 rounded-md hover:bg-[#0099CC] transition-colors ${
                            sendingMessage
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {sendingMessage ? "Sending..." : "Send Message"}
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    Select a project to view and send messages.
                  </p>
                  {projects.length > 0 && (
                    <p className="text-sm text-blue-600">
                      You have {projects.length} projects available
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Freelancers Tab */}
          {activeTab === "freelancers" && (
            <motion.div
              key="freelancers"
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
                    Available Freelancers (
                    {(filteredFreelancers && filteredFreelancers.length) || 0})
                  </h2>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search freelancers..."
                        className="border rounded-md py-2 px-4 pl-10 w-full focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          ></path>
                        </svg>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        ></path>
                      </svg>
                      Filters
                    </button>
                  </div>
                </div>

                {/* Filter panel */}
                {showFilters && (
                  <div className="bg-gray-50 p-4 rounded-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full border rounded-md p-2"
                          value={filterOptions.minRate}
                          onChange={(e) =>
                            setFilterOptions((prev) => ({
                              ...prev,
                              minRate: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full border rounded-md p-2"
                          value={filterOptions.maxRate}
                          onChange={(e) =>
                            setFilterOptions((prev) => ({
                              ...prev,
                              maxRate: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Rating
                        </label>
                        <select
                          className="w-full border rounded-md p-2"
                          value={filterOptions.minRating}
                          onChange={(e) =>
                            setFilterOptions((prev) => ({
                              ...prev,
                              minRating: e.target.value,
                            }))
                          }
                        >
                          <option value="">Any</option>
                          <option value="1">1+ Stars</option>
                          <option value="2">2+ Stars</option>
                          <option value="3">3+ Stars</option>
                          <option value="4">4+ Stars</option>
                          <option value="4.5">4.5+ Stars</option>
                        </select>
                      </div>

                      <div className="md:flex md:items-end">
                        <button
                          onClick={resetFilters}
                          className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>

                    {/* Services filter */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Services
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {allServices().map((service) => (
                          <button
                            key={service}
                            onClick={() => toggleServiceFilter(service)}
                            className={`text-sm px-3 py-1 rounded-full ${
                              filterOptions.services.includes(service)
                                ? "bg-[#00BFFF] text-white"
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            } transition-colors`}
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* No results message */}
                {(!filteredFreelancers || filteredFreelancers.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">
                      No freelancers found matching your criteria.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-4 bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}

                {/* Freelancers Grid with safe mapping */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFreelancers && filteredFreelancers.length > 0
                    ? filteredFreelancers.map((freelancer) => (
                        <motion.div
                          key={freelancer.id}
                          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          whileHover={{ y: -5, scale: 1.02 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="relative group">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br shadow-md border-2 border-white transition-transform duration-300 transform group-hover:scale-105">
                                  {freelancer.avatar_url ? (
                                    <img
                                      src={freelancer.avatar_url}
                                      alt={freelancer.full_name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.onerror = null; // Prevent infinite loop
                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                          freelancer.full_name || "User"
                                        )}&background=random&color=fff&size=128&bold=true`;
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getAvatarColor(
                                        freelancer.full_name || "User"
                                      )} text-white text-xl font-bold`}
                                    >
                                      {getInitials(freelancer.full_name)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-gray-900 truncate">
                                  {freelancer.full_name}
                                </h3>
                                <p className="text-sm text-gray-500 truncate">
                                  {freelancer.title || "Freelance Professional"}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <p className="text-gray-600 line-clamp-2 h-12 text-sm">
                                {freelancer.description ||
                                  "No description provided"}
                              </p>

                              <div className="grid grid-cols-2 gap-4 py-3">
                                <div className="bg-gray-50 p-2 rounded-lg text-center">
                                  <p className="text-xs text-gray-500">
                                    Hourly Rate
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    ${freelancer.hourly_rate || "N/A"}
                                  </p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg text-center">
                                  <p className="text-xs text-gray-500">
                                    Rating
                                  </p>
                                  <div className="flex items-center justify-center">
                                    <span className="font-semibold text-gray-900">
                                      {freelancer.rating || "N/A"}
                                    </span>
                                    {freelancer.rating && (
                                      <span className="text-yellow-400 ml-1">
                                        ★
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {freelancer.services &&
                                freelancer.services.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {freelancer.services
                                      .slice(0, 3)
                                      .map((service, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                                        >
                                          {service}
                                        </span>
                                      ))}
                                    {freelancer.services.length > 3 && (
                                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                                        +{freelancer.services.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                              <button
                                onClick={() => {
                                  setSelectedFreelancer(freelancer);
                                  setActiveTab("messages");
                                }}
                                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-medium"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                  />
                                </svg>
                                Contact
                              </button>
                              <button
                                onClick={() =>
                                  handleProjectRequest(freelancer.id)
                                }
                                className="flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 text-sm font-medium"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                                Hire Now
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Funds Modal */}
        {showAddFundsModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Funds to Your Account</h2>
                <button
                  onClick={() => {
                    setShowAddFundsModal(false);
                    setFundError("");
                    setFundAmount("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              {insufficientFunds && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                  <p>You have insufficient funds to complete this payment.</p>
                  <p className="font-medium">
                    Current balance: ${(clientData?.balance || 0).toFixed(2)}
                  </p>
                </div>
              )}

              <form onSubmit={handleAddFunds}>
                <div className="mb-4">
                  <label
                    htmlFor="fundAmount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Amount to Add (USD)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="fundAmount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="block w-full pl-8 pr-12 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {fundError && (
                  <div className="mb-4 text-red-500 text-sm">{fundError}</div>
                )}

                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">
                    Payment Information (Mock)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        className="block w-full border border-gray-300 rounded-md p-2"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          className="block w-full border border-gray-300 rounded-md p-2"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          className="block w-full border border-gray-300 rounded-md p-2"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This is a mock payment form. No real payment will be
                    processed.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddFundsModal(false)}
                    className="mr-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingFunds}
                    className={`bg-[#00BFFF] text-white px-4 py-2 rounded-md hover:bg-[#0099CC] transition-colors ${
                      processingFunds ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {processingFunds ? "Processing..." : "Add Funds"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Add the ProjectModal */}
        <ProjectModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          freelancerId={selectedFreelancerForProject}
          clientId={id}
        />
      </div>
    </div>
  );
}
