import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "./prisma";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

type HealthJobData = {
  orgId: string;
};

const worker = new Worker<HealthJobData>(
  "health-events",
  async (job: Job<HealthJobData>) => {
    const { orgId } = job.data;
    const vendors = await prisma.vendor.findMany({ where: { orgId } });
    const now = new Date();
    // Create synthetic late shipment anomalies randomly
    const events = vendors
      .filter((_, i) => i % 5 === 0)
      .map((v) => ({
        orgId,
        vendorId: v.id,
        type: "LATE_SHIPMENT",
        severity: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)],
        details: { observedAt: now.toISOString(), avgDelayDays: 2 + (Math.random() * 5) },
        createdAt: now,
      }));
    if (events.length > 0) {
      await prisma.healthEvent.createMany({ data: events });
    }
    return { created: events.length };
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Health job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Health job ${job?.id} failed:`, err);
});


