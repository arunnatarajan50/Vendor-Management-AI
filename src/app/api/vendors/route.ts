import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET() {
  const orgId = "seed-org";
  const vendors = await prisma.vendor.findMany({ where: { orgId }, orderBy: { name: "asc" } });
  return NextResponse.json({ vendors });
}

export async function POST(req: NextRequest) {
  const orgId = "seed-org";
  const body = await req.json();
  const { id, name, categories, priceIndex, qualityScore, avgLeadDays } = body || {};
  if (!name || !Array.isArray(categories)) {
    return NextResponse.json({ error: "Missing name or categories[]" }, { status: 400 });
  }
  const data = { orgId, name, categories, priceIndex: Number(priceIndex) || 1, qualityScore: Number(qualityScore) || 0.7, avgLeadDays: Number(avgLeadDays) || 7 };
  const vendor = id
    ? await prisma.vendor.update({ where: { id }, data })
    : await prisma.vendor.create({ data });
  return NextResponse.json({ vendor });
}


