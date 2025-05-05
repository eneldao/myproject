import React from "react";

interface ProjectStatusBadgeProps {
  status: string;
}

const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status }) => {
  let bgColor = "";
  let textColor = "";
  let label = status;

  switch (status) {
    case "completed":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      label = "Completed";
      break;
    case "in_progress":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      label = "In Progress";
      break;
    case "pending":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      label = "Pending";
      break;
    case "rejected":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      label = "Rejected";
      break;
    case "paid":
      bgColor = "bg-purple-100";
      textColor = "text-purple-800";
      label = "Paid";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {label}
    </span>
  );
};

export default ProjectStatusBadge;
