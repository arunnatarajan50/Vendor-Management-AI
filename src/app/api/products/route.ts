import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET(_req: NextRequest) {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ products });
}


