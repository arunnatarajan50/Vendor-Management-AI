import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET(_req: NextRequest) {
  const orgId = "seed-org";
  const events = await prisma.healthEvent.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    include: { vendor: { select: { name: true } } },
    take: 100,
  });
  return NextResponse.json({ events });
}


