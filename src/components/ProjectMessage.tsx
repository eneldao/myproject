import React from "react";

interface ProjectMessageProps {
  content: string;
  isCurrentUser: boolean;
  createdAt: string;
  senderName?: string;
}

const ProjectMessage: React.FC<ProjectMessageProps> = ({
  content,
  isCurrentUser,
  createdAt,
  senderName,
}) => {
  // Format the timestamp
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`mb-4 ${isCurrentUser ? "text-right" : "text-left"}`}>
      {!isCurrentUser && senderName && (
        <div className="text-xs text-gray-600 mb-1">{senderName}</div>
      )}
      <div
        className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
          isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        {content}
      </div>
      <div className="text-xs text-gray-500 mt-1">{formatDate(createdAt)}</div>
    </div>
  );
};

export default ProjectMessage;
