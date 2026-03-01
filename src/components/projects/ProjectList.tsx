"use client";
import { useState } from "react";
import { PrintTask, Project } from "@/lib/types";

interface Props {
  projects: {
    projects: Project[];
    addProject: (name: string, description: string) => void;
    deleteProject: (id: string) => void;
  };
  tasks: PrintTask[];
}

export default function ProjectList({ projects, tasks }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Projects</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
        >
          + New Project
        </button>
      </div>

      {projects.projects.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <div className="text-3xl mb-2">📁</div>
          <p>No projects yet.</p>
          <p className="text-sm mt-1">
            Create projects to group prints and track costs.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.projects.map((project) => {
            const projectTasks = tasks.filter(
              (t) => t.projectId === project.id
            );
            const totalWeight = projectTasks.reduce(
              (sum, t) => sum + t.weightGrams,
              0
            );

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    {project.description && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => projects.deleteProject(project.id)}
                    className="text-xs text-red-500"
                  >
                    Delete
                  </button>
                </div>

                <div className="flex gap-4 text-xs text-gray-600">
                  <span>🖨️ {projectTasks.length} prints</span>
                  <span>⚖️ {totalWeight.toFixed(0)}g</span>
                </div>

                {projectTasks.length > 0 && (
                  <div className="border-t pt-2 mt-2 space-y-1">
                    {projectTasks.map((t) => (
                      <div
                        key={t.id}
                        className="text-xs flex justify-between text-gray-600"
                      >
                        <span className="truncate">{t.title || "Untitled"}</span>
                        <span className="shrink-0 ml-2">
                          {t.weightGrams.toFixed(1)}g
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md p-5">
            <h3 className="text-lg font-bold mb-4">New Project</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                  placeholder="My project"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setShowAdd(false);
                  setName("");
                  setDesc("");
                }}
                className="flex-1 border rounded-lg py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  projects.addProject(name, desc);
                  setShowAdd(false);
                  setName("");
                  setDesc("");
                }}
                disabled={!name}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
