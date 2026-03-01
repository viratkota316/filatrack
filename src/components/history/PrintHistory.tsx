"use client";
import { useState } from "react";
import { FilamentSpool, PrintTask, Project } from "@/lib/types";
import * as storage from "@/lib/storage";

interface Props {
  token: string;
  history: {
    tasks: PrintTask[];
    syncing: boolean;
    syncMessage: string | null;
    syncTasks: (
      token: string,
      deviceId: string,
      spools: FilamentSpool[]
    ) => Promise<FilamentSpool[] | null>;
    assignSpool: (taskId: string, spoolId: string) => void;
    assignProject: (taskId: string, projectId: string | null) => void;
  };
  spools: FilamentSpool[];
  projects: Project[];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function PrintHistory({ token, history, spools, projects }: Props) {
  const [matchingTask, setMatchingTask] = useState<string | null>(null);

  const handleSync = async () => {
    const deviceId = storage.getSelectedDeviceId();
    if (!deviceId) {
      alert("No printer selected. Visit Dashboard first.");
      return;
    }
    await history.syncTasks(token, deviceId, spools);
  };

  const unmatched = history.tasks.filter((t) => !t.isDeducted);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Print History</h2>
        <button
          onClick={handleSync}
          disabled={history.syncing}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {history.syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {history.syncMessage && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
          {history.syncMessage}
        </p>
      )}

      {unmatched.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
          ⚠️ {unmatched.length} print(s) need spool matching
        </div>
      )}

      {history.tasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <div className="text-3xl mb-2">📋</div>
          <p>No print history yet.</p>
          <p className="text-sm mt-1">
            Hit &quot;Sync Now&quot; to pull your completed prints.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.tasks.map((task) => {
            const matched = spools.find((s) => s.id === task.matchedSpoolId);
            return (
              <div key={task.id} className="bg-white rounded-xl shadow p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">
                        {task.title || "Untitled Print"}
                      </span>
                      {task.isDeducted ? (
                        <span className="text-green-500 text-xs">&#10003;</span>
                      ) : (
                        <span className="text-orange-500 text-xs">!</span>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      <span>{task.weightGrams.toFixed(1)}g</span>
                      <span>{formatDuration(task.costTimeSeconds)}</span>
                      <span>
                        {new Date(task.startTime).toLocaleDateString()}
                      </span>
                    </div>

                    {matched && (
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{
                            backgroundColor: `#${matched.colorHex.slice(0, 6)}`,
                          }}
                        />
                        <span className="text-xs text-gray-600">
                          {matched.brand} {matched.material}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setMatchingTask(matchingTask === task.id ? null : task.id)
                    }
                    className="text-xs text-blue-600 ml-2 shrink-0"
                  >
                    {task.isDeducted ? "Change" : "Match"}
                  </button>
                </div>

                {matchingTask === task.id && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <p className="text-xs font-medium text-gray-700">
                      Select spool:
                    </p>
                    {spools
                      .filter((s) => !s.isArchived)
                      .map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            history.assignSpool(task.id, s.id);
                            setMatchingTask(null);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-left"
                        >
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{
                              backgroundColor: `#${s.colorHex.slice(0, 6)}`,
                            }}
                          />
                          <div className="text-xs">
                            <span className="font-medium">
                              {s.brand} - {s.material}
                            </span>
                            <span className="text-gray-500 ml-2">
                              {Math.round(s.remainingWeightGrams)}g left
                            </span>
                          </div>
                        </button>
                      ))}

                    <p className="text-xs font-medium text-gray-700 mt-2">
                      Assign to project:
                    </p>
                    <select
                      value={task.projectId || ""}
                      onChange={(e) =>
                        history.assignProject(
                          task.id,
                          e.target.value || null
                        )
                      }
                      className="w-full border rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="">No project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
