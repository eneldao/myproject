// Updated Client Messages Implementation
import { useState, useEffect } from "react";
import { Project, ProjectMessage } from "@/lib/types";

interface ClientMessagesProps {
  projects: Project[];
  clientId: string;
}

const ClientMessages = ({ projects, clientId }: ClientMessagesProps) => {
  // State for messages
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageSent, setMessageSent] = useState(false);

  // Effect to fetch messages when selected project changes
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
        setMessageError("Failed to load messages. Please try again.");
      }
    };

    fetchMessages();
  }, [selectedProject]);

  // Handler for sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessageError(null);
    setMessageSent(false);

    if (!selectedProject || !newMessage.trim()) {
      setMessageError("Please select a project and enter a message.");
      return;
    }

    setSendingMessage(true);

    try {
      const messageData = {
        project_id: selectedProject.id,
        sender_id: clientId,
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();

      // Add the new message to the list
      setMessages([...messages, data[0]]);
      setNewMessage("");
      setMessageSent(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessageSent(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessageError(
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again."
      );
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Project Messages
      </h2>

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
          value={selectedProject?.id || ""}
          onChange={(e) => {
            const project = projects.find((p) => p.id === e.target.value);
            setSelectedProject(project || null);
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
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">No messages yet.</p>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg max-w-3/4 ${
                      message.sender_id === clientId
                        ? "bg-blue-100 ml-auto"
                        : "bg-gray-200"
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1">
                      {message.sender_id === clientId ? "You" : "Freelancer"}
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
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
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
          <p className="text-gray-600">
            Select a project to view and send messages.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientMessages;
