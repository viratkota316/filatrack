import { CloudPrintTask, FilamentSpool } from "./types";

function parseRGB(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").slice(0, 6);
  const num = parseInt(clean, 16) || 0;
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

function colorDistance(hex1: string, hex2: string): number {
  const [r1, g1, b1] = parseRGB(hex1);
  const [r2, g2, b2] = parseRGB(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function findBestMatch(
  task: CloudPrintTask,
  spools: FilamentSpool[]
): FilamentSpool | null {
  const mapping = task.amsDetailMapping?.flat();
  const entry = mapping?.[0];
  if (!entry?.filament_type) return null;

  const materialType = entry.filament_type.toUpperCase();
  const colorHex = entry.filament_color || "";

  const active = spools.filter(
    (s) => !s.isArchived && s.material.toUpperCase() === materialType
  );
  if (active.length === 0) return null;

  if (!colorHex) {
    return active.sort(
      (a, b) => b.remainingWeightGrams - a.remainingWeightGrams
    )[0];
  }

  return active.sort((a, b) => {
    const dA = colorDistance(a.colorHex, colorHex);
    const dB = colorDistance(b.colorHex, colorHex);
    if (Math.abs(dA - dB) > 5) return dA - dB;
    return b.remainingWeightGrams - a.remainingWeightGrams;
  })[0];
}
