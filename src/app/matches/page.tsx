"use client";
import { useEffect, useState } from "react";

type Product = { id: string; name: string };

export default function MatchesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((j) => setProducts(j.products));
  }, []);

  const getMatches = async () => {
    if (!productId) return;
    const res = await fetch(`/api/match?productId=${productId}`);
    const json = await res.json();
    setMatches(json.matches || []);
  };

  const createDraft = async (vendorId: string) => {
    if (!productId) return;
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, vendorId, quantity: 10 }),
    });
    const j = await res.json();
    alert(`Draft order ${j.order.id} created`);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Vendor Matches</h1>
      <div className="flex gap-2 items-center mb-4 border rounded-lg p-4">
        <select
          className="border rounded p-2"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">Select product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button onClick={getMatches} className="px-4 py-2 rounded bg-black text-white">
          Get Matches
        </button>
      </div>

      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2 border">Vendor</th>
            <th className="text-left p-2 border">Score</th>
            <th className="text-left p-2 border">Evidence</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr key={m.vendor.id}>
              <td className="p-2 border">{m.vendor.name}</td>
              <td className="p-2 border">
                <div className="flex items-center gap-2">
                  <span>{m.score.toFixed(3)}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200"
                    title={`ml: ${typeof m.evidence.mlScore === "number" ? m.evidence.mlScore.toFixed(3) : "N/A"}, rules: ${typeof m.evidence.rulesScore === "number" ? m.evidence.rulesScore.toFixed(3) : "N/A"}`}
                  >
                    Blend: 70% ML / 30% rules
                  </span>
                </div>
              </td>
              <td className="p-2 border">
                <pre className="text-xs">{JSON.stringify(m.evidence)}</pre>
              </td>
              <td className="p-2 border text-center">
                <button
                  className="px-3 py-1 rounded bg-indigo-600 text-white"
                  onClick={() => createDraft(m.vendor.id)}
                >
                  Create Draft Order
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


