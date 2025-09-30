"use client";
import { useEffect, useState } from "react";

export default function VendorPage() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<string>("");
  const [priceIndex, setPriceIndex] = useState<string>("1.0");
  const [qualityScore, setQualityScore] = useState<string>("0.8");
  const [avgLeadDays, setAvgLeadDays] = useState<string>("7");
  const [vendors, setVendors] = useState<any[]>([]);

  const load = async () => {
    const r = await fetch("/api/vendors");
    const j = await r.json();
    setVendors(j.vendors || []);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const res = await fetch("/api/vendors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        categories: categories.split(",").map((s) => s.trim()).filter(Boolean),
        priceIndex,
        qualityScore,
        avgLeadDays,
      }),
    });
    if (res.ok) {
      setName("");
      setCategories("");
      await load();
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Vendor Profile</h1>
      <div className="grid gap-3 max-w-xl border rounded-lg p-4">
        <input className="border rounded p-2" placeholder="Vendor name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border rounded p-2" placeholder="Categories (comma separated)" value={categories} onChange={(e) => setCategories(e.target.value)} />
        <div className="grid grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="Price Index" value={priceIndex} onChange={(e) => setPriceIndex(e.target.value)} />
          <input className="border rounded p-2" placeholder="Quality 0..1" value={qualityScore} onChange={(e) => setQualityScore(e.target.value)} />
          <input className="border rounded p-2" placeholder="Lead Days" value={avgLeadDays} onChange={(e) => setAvgLeadDays(e.target.value)} />
        </div>
        <button className="px-4 py-2 rounded bg-black text-white w-fit" onClick={save}>Save Vendor</button>
      </div>

      <h2 className="mt-8 font-medium">Your Listings</h2>
      <table className="w-full text-sm border mt-2 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2 border">Name</th>
            <th className="text-left p-2 border">Categories</th>
            <th className="text-left p-2 border">PriceIdx</th>
            <th className="text-left p-2 border">Quality</th>
            <th className="text-left p-2 border">LeadDays</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v.id}>
              <td className="p-2 border">{v.name}</td>
              <td className="p-2 border">{v.categories.join(", ")}</td>
              <td className="p-2 border">{v.priceIndex}</td>
              <td className="p-2 border">{v.qualityScore}</td>
              <td className="p-2 border">{v.avgLeadDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


