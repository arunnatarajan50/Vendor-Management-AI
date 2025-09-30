"use client";
import { useEffect, useState } from "react";

type Product = { id: string; name: string; category: string };

export default function ScorecardsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((j) => setProducts(j.products || []));
  }, []);

  const load = async () => {
    if (!productId) return;
    setLoading(true);
    const res = await fetch(`/api/match?productId=${productId}`);
    const j = await res.json();
    setMatches(j.matches || []);
    setProduct(j.product || null);
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Vendor Scorecards</h1>
      <div className="flex gap-2 items-center mb-4 border rounded-lg p-4">
        <select className="border rounded p-2" value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Select product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button onClick={load} className="px-4 py-2 rounded bg-black text-white" disabled={!productId || loading}>
          {loading ? "Scoring..." : "Generate Scorecards"}
        </button>
      </div>

      {product && (
        <div className="mb-6 text-sm text-gray-600">Product: <span className="font-medium text-black">{product.name}</span> · Category: {product.category}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((m) => (
          <div key={m.vendor.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{m.vendor.name}</div>
                <div className="text-xs text-gray-500">Categories: {m.vendor.categories.join(", ")}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold">{m.score.toFixed(3)}</div>
                <div className="text-xs text-gray-500">Overall score</div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <Metric label="Category match" value={m.evidence.categoryMatch} format={(v) => (v ? "Yes" : "No")} />
              <Metric label="Price component" value={m.evidence.priceComponent} />
              <Metric label="Lead time component" value={m.evidence.leadTimeComponent} />
              <Metric label="Quality component" value={m.evidence.qualityComponent} />
            </div>

            <div className="mt-4 text-xs text-gray-500">Weights: cat {m.evidence.weights.category}, price {m.evidence.weights.price}, lead {m.evidence.weights.lead}, quality {m.evidence.weights.quality}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, format }: { label: string; value: number; format?: (v: number) => string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-gray-600">{format ? format(value) : `${pct}%`}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded">
        <div className="h-2 bg-indigo-600 rounded" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}


