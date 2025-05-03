"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Freelancer, Client, Project } from "@/lib/types";

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

        setFreelancers(freelancersData);
        setFilteredFreelancers(freelancersData);
      } catch (err) {
        console.error("Error fetching freelancers:", err);
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
  const handleSendTestMessage = async () => {
    if (!selectedProject) {
      setMessageError("Please select a project first");
      return;
    }

    try {
      setSendingMessage(true);
      setMessageError("");

      const testMessage = `This is a test message for project ${selectedProject}. Sent at ${new Date().toLocaleString()}`;

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: testMessage,
          project_id: selectedProject,
          sender_id: id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to send test message: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Test message response:", data);

      // Add the new message to the messages state
      if (data[0]) {
        setMessages((prevMessages) => [...prevMessages, data[0]]);
      } else if (data.message) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }

      setMessageSent(true);
      setDebugInfo("Test message sent successfully!");

      // Hide the success message after 3 seconds
      setTimeout(() => {
        setMessageSent(false);
      }, 3000);

      // Refresh messages after sending test message
      setTimeout(() => {
        fetchClientMessages();
      }, 500);
    } catch (err) {
      console.error("Error sending test message:", err);
      setMessageError(
        err instanceof Error ? err.message : "Failed to send test message"
      );
      setDebugInfo(
        `Error sending test message: ${
          err instanceof Error ? err.message : String(err)
        }`
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-[#00BFFF] border-b-[#00BFFF] border-l-transparent border-r-transparent rounded-full animate-spin mb-4"></div>
          Loading client details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-xl font-semibold mb-4">
            Error Loading Data
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="w-full bg-[#00BFFF] text-white py-2 px-4 rounded-md hover:bg-[#0099CC] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const toggleServiceFilter = (service: string) => {
    setFilterOptions((prev) => {
      if (prev.services.includes(service)) {
        return {
          ...prev,
          services: prev.services.filter((s) => s !== service),
        };
      } else {
        return { ...prev, services: [...prev.services, service] };
      }
    });
  };

  const resetFilters = () => {
    setFilterOptions({
      minRate: "",
      maxRate: "",
      minRating: "",
      services: [],
    });
    setSearchTerm("");
  };

  const handleProjectRequest = (freelancerId: string) => {
    router.push(`/projects/${freelancerId}&${id}`);
  };

  // Add a function to handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim()) {
      setMessageError("Message cannot be empty");
      return;
    }

    if (!selectedProject) {
      setMessageError("Please select a project");
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
          project_id: selectedProject, // Include the selected project ID
          sender_id: id, // Using the client ID from URL params
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to send message: ${response.status}`
        );
      }

      const data = await response.json();

      // Add the new message to the messages state
      if (data[0]) {
        setMessages((prevMessages) => [...prevMessages, data[0]]);
      } else if (data.message) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }

      // Reset form
      setMessageContent("");
      setMessageSent(true);

      // Hide the success message after 3 seconds
      setTimeout(() => {
        setMessageSent(false);
      }, 3000);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessageError(
        err instanceof Error ? err.message : "Failed to send message"
      );
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-[#00BFFF] border-b-[#00BFFF] border-l-transparent border-r-transparent rounded-full animate-spin mb-4"></div>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-xl font-semibold mb-4">
            Error Loading Data
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="w-full bg-[#00BFFF] text-white py-2 px-4 rounded-md hover:bg-[#0099CC] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  function handleDownloadDeliverable(project: {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: string;
  }): void {
    // Create a simple text file with project details
    const projectDetails = `
Project: ${project.title}
Description: ${project.description}
Budget: $${project.budget}
Status: ${project.status}
Downloaded: ${new Date().toLocaleString()}
`;

    // Create a blob with the project details
    const blob = new Blob([projectDetails], { type: "text/plain" });

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a link element
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "_")}_deliverable.txt`;

    // Append the link to the document, click it, and remove it
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  return (
    <div className="max-w-7xl bg-slate-800 mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#00BFFF] hover:text-[#0099CC] transition-colors"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Clients
        </button>
      </div>

      {/* Enhanced Client Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {clientData?.company_name || clientData?.full_name || "Client"}
            </h1>
            <p className="text-gray-600">
              {clientData?.email || clientData?.contact_email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 px-4 py-2 rounded-full text-blue-600 font-medium">
              Client since{" "}
              {new Date(clientData?.created_at || "").toLocaleDateString()}
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-full text-green-600 font-medium flex items-center">
              Balance: ${(clientData?.balance || 0).toFixed(2)}
              <button
                onClick={() => setShowAddFundsModal(true)}
                className="ml-2 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>

        {/* Client detailed information */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Client Information</h2>
            <div className="space-y-3 text-sm">
              {clientData?.company_name && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Company:</span>
                  <span>{clientData.company_name}</span>
                </div>
              )}
              {clientData?.contact_name && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Contact Name:</span>
                  <span>{clientData.contact_name}</span>
                </div>
              )}
              {(clientData?.email || clientData?.contact_email) && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Email:</span>
                  <span>{clientData.email || clientData.contact_email}</span>
                </div>
              )}
              {clientData?.user_type && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">User Type:</span>
                  <span>{clientData.user_type}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Additional Details</h2>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Created:</span>
                <span>
                  {new Date(clientData?.created_at || "").toLocaleString()}
                </span>
              </div>
              {clientData?.updated_at && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Last Updated:</span>
                  <span>
                    {new Date(clientData.updated_at).toLocaleString()}
                  </span>
                </div>
              )}
              {clientData?.user_id && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">User ID:</span>
                  <span>{clientData.user_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === "projects"
              ? "border-b-2 border-[#00BFFF] text-[#00BFFF]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab("freelancers")}
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === "freelancers"
              ? "border-b-2 border-[#00BFFF] text-[#00BFFF]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Freelancers
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === "messages"
              ? "border-b-2 border-[#00BFFF] text-[#00BFFF]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Messages
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-100">
              Client Projects
            </h2>
            <Link
              href={`/projects/new?client=${id}`}
              className="bg-[#00BFFF] text-white px-4 py-2 rounded-md hover:bg-[#0099CC] transition-colors text-sm"
            >
              Create New Project
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">
                No projects found for this client.
              </p>
              <Link
                href={`/projects/new?client=${id}`}
                className="text-[#00BFFF] hover:underline"
              >
                Create their first project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg truncate">
                      {project.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        project.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : project.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : project.status === "paid"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {project.status === "in_progress"
                        ? "In Progress"
                        : project.status.charAt(0).toUpperCase() +
                          project.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-700">
                      <span className="font-semibold">${project.budget}</span>
                    </div>
                    <div className="flex space-x-2">
                      {project.status === "completed" && (
                        <button
                          onClick={() => handlePayFreelancer(project)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                          disabled={processingPayment === project.id}
                        >
                          {processingPayment === project.id ? (
                            <span className="flex items-center">
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
                              Processing
                            </span>
                          ) : (
                            "Pay Freelancer"
                          )}
                        </button>
                      )}
                      {project.status === "paid" && (
                        <button
                          onClick={() => handleDownloadDeliverable(project)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                        >
                          Download Deliverable
                        </button>
                      )}
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-[#00BFFF] hover:underline text-sm flex items-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Freelancers Tab */}
      {activeTab === "freelancers" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
                Available Freelancers ({filteredFreelancers.length})
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
            {filteredFreelancers.length === 0 && (
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

            {/* Freelancers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFreelancers.map((freelancer) => (
                <div
                  key={freelancer.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-3">
                    {freelancer.avatar_url ? (
                      <img
                        src={freelancer.avatar_url}
                        alt={`${freelancer.full_name}'s avatar`}
                        className="h-10 w-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                        <span className="text-gray-600 font-medium">
                          {freelancer.full_name?.charAt(0) || "F"}
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold truncate">
                      {freelancer.full_name}
                    </h3>
                  </div>
                  <h4 className="text-lg font-medium mb-2 truncate">
                    {freelancer.title}
                  </h4>
                  <p className="text-gray-600 mb-4 line-clamp-3 h-18">
                    {freelancer.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600">
                      <span className="font-medium">Hourly Rate:</span> $
                      {freelancer.hourly_rate || "N/A"}
                    </p>
                    {freelancer.languages &&
                      freelancer.languages.length > 0 && (
                        <p className="text-gray-600">
                          <span className="font-medium">Languages:</span>{" "}
                          {freelancer.languages.join(", ")}
                        </p>
                      )}
                    {freelancer.services && freelancer.services.length > 0 && (
                      <p className="text-gray-600 truncate">
                        <span className="font-medium">Services:</span>{" "}
                        {freelancer.services.join(", ")}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <span className="font-medium">Rating:</span>{" "}
                      <span className="flex items-center">
                        {freelancer.rating || "N/A"}
                        {freelancer.rating ? (
                          <span className="text-yellow-400 ml-1">★</span>
                        ) : null}
                        <span className="ml-1">
                          ({freelancer.reviews_count || 0} reviews)
                        </span>
                      </span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedFreelancer(freelancer);
                        setActiveTab("messages");
                      }}
                      className="text-center bg-[#00BFFF] text-white py-2 rounded-md hover:bg-[#0099CC] transition-colors"
                    >
                      Contact Now
                    </button>
                    <button
                      onClick={() => handleProjectRequest(freelancer.id)}
                      className="block text-center bg-gray-100 text-gray-800 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Request Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="bg-white rounded-lg shadow-md p-6">
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

                    <button
                      onClick={handleSendTestMessage}
                      disabled={sendingMessage}
                      className="bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm hover:bg-gray-300 transition-colors"
                    >
                      {sendingMessage ? "Sending..." : "Send a test message"}
                    </button>
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
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
                    <div className="text-red-500 text-sm">{messageError}</div>
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
                        sendingMessage ? "opacity-50 cursor-not-allowed" : ""
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
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
          </div>
        </div>
      )}
    </div>
  );
}
