"use client";
import { useEffect, useMemo, useState } from "react";

type Vendor = {
  id: string;
  name: string;
  categories: string[];
  priceIndex: number;
  qualityScore: number;
  avgLeadDays: number;
};

export default function CustomerPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [category, setCategory] = useState("");
  const [maxPriceIdx, setMaxPriceIdx] = useState("1.2");
  const [minQuality, setMinQuality] = useState("0.7");
  const [maxLead, setMaxLead] = useState("10");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/vendors").then((r) => r.json()).then((j) => setVendors(j.vendors || []));
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    const maxP = parseFloat(maxPriceIdx);
    const minQ = parseFloat(minQuality);
    const maxL = parseInt(maxLead || "999", 10);
    return vendors.filter((v) => {
      const nameOk = !s || v.name.toLowerCase().includes(s);
      const catOk = !category || v.categories.includes(category);
      const priceOk = isNaN(maxP) ? true : v.priceIndex <= maxP;
      const qualityOk = isNaN(minQ) ? true : v.qualityScore >= minQ;
      const leadOk = isNaN(maxL) ? true : v.avgLeadDays <= maxL;
      return nameOk && catOk && priceOk && qualityOk && leadOk;
    });
  }, [vendors, search, category, maxPriceIdx, minQuality, maxLead]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => v.categories.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [vendors]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Marketplace</h1>
      <div className="grid gap-3 sm:grid-cols-5 mb-4 border rounded-lg p-4">
        <input className="border rounded p-2 sm:col-span-2" placeholder="Search vendor name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border rounded p-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input className="border rounded p-2" placeholder="Max priceIdx" value={maxPriceIdx} onChange={(e) => setMaxPriceIdx(e.target.value)} />
        <input className="border rounded p-2" placeholder="Min quality" value={minQuality} onChange={(e) => setMinQuality(e.target.value)} />
        <input className="border rounded p-2" placeholder="Max lead days" value={maxLead} onChange={(e) => setMaxLead(e.target.value)} />
      </div>

      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2 border">Vendor</th>
            <th className="text-left p-2 border">Categories</th>
            <th className="text-left p-2 border">PriceIdx</th>
            <th className="text-left p-2 border">Quality</th>
            <th className="text-left p-2 border">LeadDays</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((v) => (
            <tr key={v.id}>
              <td className="p-2 border">{v.name}</td>
              <td className="p-2 border">{v.categories.join(", ")}</td>
              <td className="p-2 border">{v.priceIndex.toFixed(2)}</td>
              <td className="p-2 border">{v.qualityScore.toFixed(2)}</td>
              <td className="p-2 border">{v.avgLeadDays}</td>
              <td className="p-2 border text-center">
                <a className="px-3 py-1 rounded bg-indigo-600 text-white inline-block" href={`/matches?pref=${encodeURIComponent(JSON.stringify({ category: category || null }))}`}>
                  See Matches
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


