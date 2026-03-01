import { FilamentSpool, PrintTask, Project } from "./types";

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Auth ----

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bambu_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("bambu_token", token);
}

export function getAuthUID(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bambu_uid");
}

export function setAuthUID(uid: string) {
  localStorage.setItem("bambu_uid", uid);
}

export function clearAuth() {
  localStorage.removeItem("bambu_token");
  localStorage.removeItem("bambu_uid");
  localStorage.removeItem("bambu_email");
}

// ---- Spools ----

export function getSpools(): FilamentSpool[] {
  return getItem<FilamentSpool[]>("spools", []);
}

export function saveSpools(spools: FilamentSpool[]) {
  setItem("spools", spools);
}

// ---- Tasks ----

export function getTasks(): PrintTask[] {
  return getItem<PrintTask[]>("tasks", []);
}

export function saveTasks(tasks: PrintTask[]) {
  setItem("tasks", tasks);
}

// ---- Projects ----

export function getProjects(): Project[] {
  return getItem<Project[]>("projects", []);
}

export function saveProjects(projects: Project[]) {
  setItem("projects", projects);
}

// ---- Selected Device ----

export function getSelectedDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("selected_device_id");
}

export function setSelectedDeviceId(id: string) {
  localStorage.setItem("selected_device_id", id);
}
