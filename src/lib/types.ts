// ---- Inventory ----

export interface FilamentSpool {
  id: string;
  brand: string;
  material: string;
  colorName: string;
  colorHex: string; // RRGGBB
  totalWeightGrams: number;
  remainingWeightGrams: number;
  costPerSpool: number;
  currency: string;
  notes: string;
  lowStockThresholdGrams: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Print Tasks ----

export interface PrintTask {
  id: string;
  cloudTaskId: string;
  title: string;
  status: string;
  startTime: string;
  endTime: string;
  weightGrams: number;
  costTimeSeconds: number;
  deviceId: string;
  coverURL: string;
  isDeducted: boolean;
  matchedSpoolId: string | null;
  projectId: string | null;
  createdAt: string;
}

// ---- Projects ----

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Bambu API ----

export interface BambuDevice {
  dev_id: string;
  name: string;
  online: boolean;
  print_status?: string;
  dev_model_name?: string;
  dev_product_name?: string;
}

export interface CloudPrintTask {
  id: string;
  title: string;
  status: string;
  startTime?: string;
  endTime?: string;
  weight?: number;
  costTime?: number;
  deviceId?: string;
  cover?: string;
  amsDetailMapping?: AmsDetailEntry[][];
}

export interface AmsDetailEntry {
  ams_id?: number;
  slot_id?: number;
  filament_type?: string;
  filament_color?: string;
  weight?: number;
}

// ---- Printer Status (from polling) ----

export interface PrinterStatusInfo {
  isOnline: boolean;
  printStatus: string;
  deviceName: string;
  deviceId: string;
}
