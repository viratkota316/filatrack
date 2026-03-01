"use client";
import { useState, useEffect, useCallback } from "react";
import { BambuDevice } from "@/lib/types";
import * as storage from "@/lib/storage";

interface Props {
  token: string;
}

export default function Dashboard({ token }: Props) {
  const [devices, setDevices] = useState<BambuDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bambu/devices", {
        headers: { "x-bambu-token": token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const devs: BambuDevice[] = data.devices || [];
      setDevices(devs);
      if (devs.length > 0) {
        storage.setSelectedDeviceId(devs[0].dev_id);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchDevices}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <div className="text-4xl mb-3">🖨️</div>
        <p className="font-medium">No printers found</p>
        <p className="text-sm mt-1">
          Make sure your printer is bound to your Bambu Lab account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Your Printers</h2>
      {devices.map((dev) => (
        <div
          key={dev.dev_id}
          className="bg-white rounded-xl shadow p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                dev.online ? "bg-green-500" : "bg-red-400"
              }`}
            />
            <div>
              <h3 className="font-semibold">{dev.name}</h3>
              <p className="text-xs text-gray-500">
                {dev.dev_model_name || dev.dev_product_name || "Bambu Lab"} &middot;{" "}
                {dev.dev_id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Status</p>
              <p className="font-medium">
                {dev.online ? (dev.print_status || "Online") : "Offline"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Connection</p>
              <p className="font-medium">
                {dev.online ? (
                  <span className="text-green-600">Connected</span>
                ) : (
                  <span className="text-red-500">Disconnected</span>
                )}
              </p>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={fetchDevices}
        className="w-full text-sm text-blue-600 py-2 hover:text-blue-800"
      >
        Refresh
      </button>
    </div>
  );
}
