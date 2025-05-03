import React, { useState, useEffect } from "react";

const ProjectsManager = () => {
  interface Project {
    id: string;
    client_id: string;
    freelancer_id: string;
    status: string;
  }

  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState({
    clientId: "",
    freelancerId: "",
    status: "",
  });
  const [newProject, setNewProject] = useState({
    client_id: "",
    freelancer_id: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/projects?${queryParams}`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      const data = await response.json();
      setProjects((prev) => [...prev, data]);
      setNewProject({ client_id: "", freelancer_id: "", status: "" });
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      <h1>Projects Manager</h1>

      <div>
        <h2>Filters</h2>
        <input
          type="text"
          placeholder="Client ID"
          value={filters.clientId}
          onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
        />
        <input
          type="text"
          placeholder="Freelancer ID"
          value={filters.freelancerId}
          onChange={(e) =>
            setFilters({ ...filters, freelancerId: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Status"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        />
        <button onClick={fetchProjects} disabled={loading}>
          {loading ? "Loading..." : "Fetch Projects"}
        </button>
      </div>

      <div>
        <h2>Create New Project</h2>
        <input
          type="text"
          placeholder="Client ID"
          value={newProject.client_id}
          onChange={(e) =>
            setNewProject({ ...newProject, client_id: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Freelancer ID"
          value={newProject.freelancer_id}
          onChange={(e) =>
            setNewProject({ ...newProject, freelancer_id: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Status"
          value={newProject.status}
          onChange={(e) =>
            setNewProject({ ...newProject, status: e.target.value })
          }
        />
        <button onClick={createProject}>Create Project</button>
      </div>

      <div>
        <h2>Projects</h2>
        {projects.length > 0 ? (
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                {project.id} - {project.client_id} - {project.freelancer_id} -{" "}
                {project.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectsManager;
