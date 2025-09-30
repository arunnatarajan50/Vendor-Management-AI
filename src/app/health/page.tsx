"use client";
import { useEffect, useState } from "react";

type HealthEvent = {
  id: string;
  type: string;
  severity: string;
  vendor: { name: string };
  createdAt: string;
};

export default function HealthPage() {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/health");
    const j = await res.json();
    setEvents(j.events || []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const kick = async () => {
    setLoading(true);
    await fetch("/api/health/kick", { method: "POST" });
    await new Promise((r) => setTimeout(r, 500));
    await refresh();
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Vendor Health</h1>
      <div className="mb-4 flex gap-2">
        <button className="px-4 py-2 rounded bg-black text-white" onClick={kick} disabled={loading}>
          {loading ? "Generating..." : "Generate Synthetic Events"}
        </button>
        <button className="px-4 py-2 rounded border" onClick={refresh}>Refresh</button>
      </div>
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2 border">Time</th>
            <th className="text-left p-2 border">Vendor</th>
            <th className="text-left p-2 border">Type</th>
            <th className="text-left p-2 border">Severity</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td className="p-2 border">{new Date(e.createdAt).toLocaleString()}</td>
              <td className="p-2 border">{e.vendor?.name}</td>
              <td className="p-2 border">{e.type}</td>
              <td className="p-2 border">{e.severity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


