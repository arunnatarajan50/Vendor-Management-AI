"use client";
import { useState } from "react";

export default function ImportPage() {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const onUpload = async () => {
    const res = await fetch("/api/products/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const json = await res.json();
    setResult(JSON.stringify(json));
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsv(text);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Import Products</h1>
      <div className="mb-3">
        <input type="file" accept=".csv" onChange={onFile} />
      </div>
      <textarea
        className="w-full h-56 border rounded-lg p-2 font-mono text-sm"
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        placeholder="sku,name,category,specs\nSKU-1,Widget,Electronics,{\"color\":\"red\"}"
      />
      <div className="mt-3">
        <button onClick={onUpload} className="px-4 py-2 rounded bg-black text-white">
          Upload
        </button>
      </div>
      {result && (
        <pre className="mt-4 p-2 bg-gray-50 border rounded-lg text-xs overflow-auto">{result}</pre>
      )}
    </div>
  );
}


