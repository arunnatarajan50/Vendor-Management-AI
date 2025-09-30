import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { z } from "zod";
import { prisma } from "@/server/prisma";

const RowSchema = z.object({
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  specs: z.string().optional(), // JSON string or empty
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let csv = "";
    if (contentType.includes("text/csv")) {
      csv = await req.text();
    } else {
      const body = await req.json();
      csv = body.csv || "";
    }

    if (!csv) {
      return NextResponse.json({ error: "Missing CSV" }, { status: 400 });
    }

    const parsed = Papa.parse(csv.trim(), { header: true, skipEmptyLines: true });
    if (parsed.errors.length) {
      return NextResponse.json({ errors: parsed.errors }, { status: 400 });
    }

    const orgId = "seed-org"; // single-tenant demo
    const rows = (parsed.data as any[]).map((r) => RowSchema.parse(r));
    const data = rows.map((r) => ({
      orgId,
      sku: r.sku,
      name: r.name,
      category: r.category,
      specs: r.specs ? JSON.parse(r.specs) : {},
    }));

    const created = await prisma.product.createMany({ data, skipDuplicates: true });
    return NextResponse.json({ created: created.count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


