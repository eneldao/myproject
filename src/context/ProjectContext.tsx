"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Project } from "@/lib/types";

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  loadingProjects: boolean;
  setProjects: (projects: Project[]) => void;
  selectProject: (project: Project | null) => void;
  updateProjectStatus: (projectId: string, status: string) => Promise<boolean>;
  refreshProjects: (freelancerId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const selectProject = useCallback((project: Project | null) => {
    setSelectedProject(project);
  }, []);

  const refreshProjects = useCallback(
    async (freelancerId: string) => {
      setLoadingProjects(true);
      try {
        // Add a timestamp to prevent caching
        const response = await fetch(
          `/api/freelancers/${freelancerId}?t=${Date.now()}`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setProjects(data.projects || []);

        // Update selected project if exists
        if (selectedProject) {
          const updatedSelectedProject = data.projects.find(
            (p: Project) => p.id === selectedProject.id
          );
          if (updatedSelectedProject) {
            setSelectedProject(updatedSelectedProject);
          }
        }
      } catch (error) {
        console.error("Failed to refresh projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    },
    [selectedProject]
  );

  const updateProjectStatus = useCallback(
    async (projectId: string, status: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const updatedProject = await response.json();

        // Update project in state
        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project.id === projectId ? updatedProject : project
          )
        );

        // Update selected project if it's the one being modified
        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject(updatedProject);
        }

        return true;
      } catch (error) {
        console.error("Failed to update project status:", error);
        return false;
      }
    },
    [selectedProject]
  );

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        loadingProjects,
        setProjects,
        selectProject,
        updateProjectStatus,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
