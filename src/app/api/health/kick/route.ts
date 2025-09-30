import { NextRequest, NextResponse } from "next/server";
import { healthQueue } from "@/server/queue";

export async function POST(_req: NextRequest) {
  const orgId = "seed-org";
  const job = await healthQueue.add("generate", { orgId }, { removeOnComplete: true, removeOnFail: true });
  return NextResponse.json({ enqueued: true, jobId: job.id });
}


