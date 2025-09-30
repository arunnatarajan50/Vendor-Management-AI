import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { scoreVendorForProductAsync } from "@/server/reco";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const orgId = "seed-org";
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  const product = await prisma.product.findFirst({ where: { id: productId, orgId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const vendors = await prisma.vendor.findMany({ where: { orgId } });
  const scoredRaw = await Promise.all(
    vendors.map(async (v) => ({ v, ...(await scoreVendorForProductAsync(product, v)) }))
  );
  const scored = scoredRaw
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  await prisma.match.createMany({
    data: scored.map((s) => ({
      orgId,
      productId: product.id,
      vendorId: s.v.id,
      score: s.score,
      evidence: s.evidence,
    })),
  });

  return NextResponse.json({
    product,
    matches: scored.map((s) => ({
      vendor: s.v,
      score: s.score,
      evidence: s.evidence,
    })),
  });
}


