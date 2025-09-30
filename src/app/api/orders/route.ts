import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, vendorId, quantity } = body || {};
  const orgId = "seed-org";
  if (!productId || !vendorId || !quantity) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const order = await prisma.order.create({
    data: { orgId, productId, vendorId, quantity, status: "DRAFT" },
  });
  return NextResponse.json({ order });
}


