import React from "react";
import { PaymentButton } from "./PaymentButton";

interface ProjectCardProps {
  project: {
    id: string;
    client_id: string;
    freelancer_id: string;
    budget: number;
    status: string;
  };
  userRole: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, userRole }) => {
  return (
    <div className="project-card">
      <h3>{project.id}</h3>
      <p>Status: {project.status}</p>
      {userRole === "client" && project.status === "completed" && (
        <div className="mt-3">
          <PaymentButton
            projectId={project.id}
            clientId={project.client_id}
            freelancerId={project.freelancer_id}
            amount={project.budget}
            onPaymentComplete={() => {
              // Optionally refresh data or update local state
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
