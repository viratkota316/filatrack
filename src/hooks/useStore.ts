"use client";
import { useState, useEffect, useCallback } from "react";
import {
  FilamentSpool,
  PrintTask,
  Project,
  CloudPrintTask,
} from "@/lib/types";
import * as storage from "@/lib/storage";
import { findBestMatch } from "@/lib/matcher";

function uuid() {
  return crypto.randomUUID();
}

// ---- Auth ----

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setToken(storage.getAuthToken());
    setUid(storage.getAuthUID());
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bambu/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      storage.setAuthToken(data.token);
      storage.setAuthUID(data.uid);
      localStorage.setItem("bambu_email", email);
      setToken(data.token);
      setUid(data.uid);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    storage.clearAuth();
    setToken(null);
    setUid(null);
  }, []);

  return {
    token,
    uid,
    isLoggedIn: !!token,
    loading,
    error,
    login,
    logout,
  };
}

// ---- Inventory ----

export function useInventory() {
  const [spools, setSpools] = useState<FilamentSpool[]>([]);

  useEffect(() => {
    setSpools(storage.getSpools());
  }, []);

  const save = (updated: FilamentSpool[]) => {
    setSpools(updated);
    storage.saveSpools(updated);
  };

  const addSpool = (
    spool: Omit<FilamentSpool, "id" | "createdAt" | "updatedAt" | "isArchived">
  ) => {
    const now = new Date().toISOString();
    save([
      ...spools,
      { ...spool, id: uuid(), isArchived: false, createdAt: now, updatedAt: now },
    ]);
  };

  const updateSpool = (id: string, updates: Partial<FilamentSpool>) => {
    save(
      spools.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      )
    );
  };

  const deleteSpool = (id: string) => {
    save(spools.filter((s) => s.id !== id));
  };

  const activeSpools = spools.filter((s) => !s.isArchived);
  const lowStockSpools = activeSpools.filter(
    (s) => s.remainingWeightGrams <= s.lowStockThresholdGrams
  );

  return { spools, activeSpools, lowStockSpools, addSpool, updateSpool, deleteSpool };
}

// ---- Print History ----

export function usePrintHistory() {
  const [tasks, setTasks] = useState<PrintTask[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    setTasks(storage.getTasks());
  }, []);

  const syncTasks = useCallback(
    async (token: string, deviceId: string, spools: FilamentSpool[]) => {
      setSyncing(true);
      setSyncMessage(null);
      try {
        const res = await fetch(
          `/api/bambu/tasks?deviceId=${deviceId}&limit=50`,
          { headers: { "x-bambu-token": token } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const cloudTasks: CloudPrintTask[] = data.hits || [];
        const existing = storage.getTasks();
        const existingIds = new Set(existing.map((t) => t.cloudTaskId));
        const currentSpools = [...spools];

        let newCount = 0;
        let matched = 0;
        const newTasks: PrintTask[] = [];

        for (const ct of cloudTasks) {
          if (ct.status !== "FINISH") continue;
          if (existingIds.has(ct.id)) continue;
          if (!ct.weight || ct.weight <= 0) continue;

          const match = findBestMatch(ct, currentSpools);
          const task: PrintTask = {
            id: uuid(),
            cloudTaskId: ct.id,
            title: ct.title,
            status: ct.status,
            startTime: ct.startTime || "",
            endTime: ct.endTime || "",
            weightGrams: ct.weight,
            costTimeSeconds: ct.costTime || 0,
            deviceId: ct.deviceId || "",
            coverURL: ct.cover || "",
            isDeducted: !!match,
            matchedSpoolId: match?.id || null,
            projectId: null,
            createdAt: new Date().toISOString(),
          };
          newTasks.push(task);
          newCount++;

          if (match) {
            match.remainingWeightGrams = Math.max(
              0,
              match.remainingWeightGrams - ct.weight
            );
            matched++;
          }
        }

        const allTasks = [...existing, ...newTasks].sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        storage.saveTasks(allTasks);
        setTasks(allTasks);

        // Save updated spool weights
        if (matched > 0) {
          storage.saveSpools(currentSpools);
        }

        if (newCount === 0) {
          setSyncMessage("Already up to date");
        } else {
          setSyncMessage(
            `${newCount} new print(s), ${matched} matched to spools`
          );
        }

        return currentSpools; // Return updated spools for parent to refresh
      } catch (e: unknown) {
        setSyncMessage(e instanceof Error ? e.message : "Sync failed");
        return null;
      } finally {
        setSyncing(false);
      }
    },
    []
  );

  const assignSpool = (taskId: string, spoolId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId
        ? { ...t, matchedSpoolId: spoolId, isDeducted: true }
        : t
    );
    setTasks(updated);
    storage.saveTasks(updated);
  };

  const assignProject = (taskId: string, projectId: string | null) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, projectId } : t
    );
    setTasks(updated);
    storage.saveTasks(updated);
  };

  return { tasks, syncing, syncMessage, syncTasks, assignSpool, assignProject };
}

// ---- Projects ----

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(storage.getProjects());
  }, []);

  const save = (updated: Project[]) => {
    setProjects(updated);
    storage.saveProjects(updated);
  };

  const addProject = (name: string, description: string) => {
    const now = new Date().toISOString();
    save([
      ...projects,
      { id: uuid(), name, description, createdAt: now, updatedAt: now },
    ]);
  };

  const deleteProject = (id: string) => {
    save(projects.filter((p) => p.id !== id));
  };

  return { projects, addProject, deleteProject };
}
