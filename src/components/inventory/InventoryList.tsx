"use client";
import { useState } from "react";
import { FilamentSpool } from "@/lib/types";

const MATERIALS = [
  "PLA", "PLA+", "PETG", "ABS", "ASA", "TPU",
  "PA", "PA-CF", "PC", "PVA", "HIPS", "PLA Silk", "PLA Matte",
];

interface Props {
  inventory: {
    spools: FilamentSpool[];
    activeSpools: FilamentSpool[];
    lowStockSpools: FilamentSpool[];
    addSpool: (s: Omit<FilamentSpool, "id" | "createdAt" | "updatedAt" | "isArchived">) => void;
    updateSpool: (id: string, updates: Partial<FilamentSpool>) => void;
    deleteSpool: (id: string) => void;
  };
}

export default function InventoryList({ inventory }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = inventory.activeSpools.filter((s) => {
    if (filter && s.material !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.brand.toLowerCase().includes(q) ||
        s.material.toLowerCase().includes(q) ||
        s.colorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Inventory</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
        >
          + Add Spool
        </button>
      </div>

      {inventory.lowStockSpools.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          ⚠️ {inventory.lowStockSpools.length} spool(s) running low
        </div>
      )}

      <input
        type="text"
        placeholder="Search spools..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1 rounded-full text-xs ${
            !filter ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          All
        </button>
        {[...new Set(inventory.spools.map((s) => s.material))].sort().map((m) => (
          <button
            key={m}
            onClick={() => setFilter(m === filter ? null : m)}
            className={`px-3 py-1 rounded-full text-xs ${
              filter === m ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Spool list */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <div className="text-3xl mb-2">📦</div>
          <p>No spools yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((spool) => (
            <SpoolRow
              key={spool.id}
              spool={spool}
              onDelete={() => inventory.deleteSpool(spool.id)}
              onArchive={() =>
                inventory.updateSpool(spool.id, { isArchived: true })
              }
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddSpoolModal
          onClose={() => setShowAdd(false)}
          onSave={(s) => {
            inventory.addSpool(s);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function SpoolRow({
  spool,
  onDelete,
  onArchive,
}: {
  spool: FilamentSpool;
  onDelete: () => void;
  onArchive: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const pct = spool.totalWeightGrams > 0
    ? (spool.remainingWeightGrams / spool.totalWeightGrams) * 100
    : 0;
  const isLow = spool.remainingWeightGrams <= spool.lowStockThresholdGrams;

  return (
    <div className="bg-white rounded-xl shadow p-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 text-left"
      >
        <div
          className="w-10 h-10 rounded-full border-2 border-gray-200 shrink-0"
          style={{ backgroundColor: `#${spool.colorHex.slice(0, 6)}` }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">
              {spool.brand || "Unknown"}
            </span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {spool.material}
            </span>
            {isLow && (
              <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                Low
              </span>
            )}
          </div>
          {spool.colorName && (
            <p className="text-xs text-gray-500">{spool.colorName}</p>
          )}
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  isLow ? "bg-red-500" : pct < 30 ? "bg-orange-400" : "bg-green-500"
                }`}
                style={{ width: `${Math.max(1, pct)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {Math.round(spool.remainingWeightGrams)}g / {Math.round(spool.totalWeightGrams)}g
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t text-sm space-y-2">
          {spool.costPerSpool > 0 && (
            <p className="text-gray-600">
              Cost: ${spool.costPerSpool.toFixed(2)} ($
              {(spool.costPerSpool / spool.totalWeightGrams).toFixed(4)}/g)
            </p>
          )}
          {spool.notes && (
            <p className="text-gray-500 text-xs">{spool.notes}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onArchive}
              className="text-xs text-orange-600 hover:text-orange-800"
            >
              Archive
            </button>
            <button
              onClick={onDelete}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddSpoolModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (s: Omit<FilamentSpool, "id" | "createdAt" | "updatedAt" | "isArchived">) => void;
}) {
  const [brand, setBrand] = useState("");
  const [material, setMaterial] = useState("PLA");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("FFFFFF");
  const [totalWeight, setTotalWeight] = useState(1000);
  const [remainingWeight, setRemainingWeight] = useState(1000);
  const [cost, setCost] = useState(0);
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Add Spool</h3>
          <button onClick={onClose} className="text-gray-400 text-xl">
            &times;
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Brand</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              placeholder="e.g. Bambu Lab, eSUN, Polymaker"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Material</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
            >
              {MATERIALS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">Color Name</label>
              <input
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                placeholder="e.g. Red, Matte Black"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Color</label>
              <input
                type="color"
                value={`#${colorHex}`}
                onChange={(e) => setColorHex(e.target.value.replace("#", ""))}
                className="w-full h-10 mt-1 rounded border cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Total (g)</label>
              <input
                type="number"
                value={totalWeight}
                onChange={(e) => setTotalWeight(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Remaining (g)</label>
              <input
                type="number"
                value={remainingWeight}
                onChange={(e) => setRemainingWeight(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Cost ($)</label>
            <input
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border rounded-lg py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                brand,
                material,
                colorName,
                colorHex,
                totalWeightGrams: totalWeight,
                remainingWeightGrams: remainingWeight,
                costPerSpool: cost,
                currency: "USD",
                notes,
                lowStockThresholdGrams: 100,
              })
            }
            disabled={!brand}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
