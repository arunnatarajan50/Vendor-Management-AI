import { PrismaClient } from "@prisma/client";
import { scoreVendorForProduct } from "../src/server/reco";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.org.upsert({
    where: { id: "seed-org" },
    update: {},
    create: { id: "seed-org", name: "Demo Org" },
  });

  const users = [
    { email: "admin@demo.org", name: "Admin" },
    { email: "buyer1@demo.org", name: "Buyer One" },
    { email: "buyer2@demo.org", name: "Buyer Two" },
    { email: "ops@demo.org", name: "Ops" },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, orgId: org.id },
    });
  }

  const categories = [
    "Electronics",
    "Home",
    "Apparel",
    "Beauty",
    "Sports",
    "Grocery",
  ];

  const products = Array.from({ length: 20 }).map((_, i) => ({
    orgId: org.id,
    sku: `SKU-${1000 + i}`,
    name: `Product ${i + 1}`,
    category: categories[i % categories.length],
    specs: {
      color: ["red", "blue", "green"][i % 3],
      weightKg: 0.5 + (i % 5) * 0.25,
      dimensionsCm: { w: 10 + i, h: 5 + (i % 4), d: 2 + (i % 3) },
      materials: ["cotton", "plastic", "metal"][i % 3],
    },
  }));

  await prisma.product.createMany({ data: products });

  const vendors = Array.from({ length: 25 }).map((_, i) => ({
    orgId: org.id,
    name: `Vendor ${i + 1}`,
    categories: [
      categories[i % categories.length],
      categories[(i + 1) % categories.length],
    ],
    priceIndex: 0.8 + (i % 7) * 0.06, // ~0.8 - 1.16
    qualityScore: 0.6 + (i % 5) * 0.08, // ~0.6 - 0.92
    avgLeadDays: 3 + (i % 10),
  }));

  await prisma.vendor.createMany({ data: vendors });

  // Create example matches and draft orders using the scoring function
  const seededProducts = await prisma.product.findMany({ where: { orgId: org.id }, orderBy: { createdAt: "asc" } });
  const seededVendors = await prisma.vendor.findMany({ where: { orgId: org.id } });

  const topProducts = seededProducts.slice(0, 5);
  for (const p of topProducts) {
    const scored = seededVendors
      .map((v) => ({ v, ...scoreVendorForProduct(p as any, v as any) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    await prisma.match.createMany({
      data: scored.map((s) => ({
        orgId: org.id,
        productId: p.id,
        vendorId: s.v.id,
        score: s.score,
        evidence: s.evidence,
      })),
      skipDuplicates: true,
    });
  }

  // Create a few draft orders
  const exampleOrders = [
    { productIndex: 0, vendorIndex: 0, quantity: 10 },
    { productIndex: 1, vendorIndex: 2, quantity: 25 },
    { productIndex: 2, vendorIndex: 1, quantity: 15 },
  ];
  for (const o of exampleOrders) {
    const p = seededProducts[o.productIndex];
    const v = seededVendors[o.vendorIndex];
    if (p && v) {
      await prisma.order.create({
        data: { orgId: org.id, productId: p.id, vendorId: v.id, quantity: o.quantity, status: "DRAFT" },
      });
    }
  }

  // Insert a few health events
  await prisma.healthEvent.createMany({
    data: seededVendors.slice(0, 5).map((v, i) => ({
      orgId: org.id,
      vendorId: v.id,
      type: i % 2 === 0 ? "LATE_SHIPMENT" : "DEFECT_RATE_SPIKE",
      severity: ["LOW", "MEDIUM", "HIGH"][i % 3],
      details: { note: "Synthetic seed event" },
      createdAt: new Date(),
    })),
  });

  console.log("Seed complete: org, users, products, vendors, matches, orders, health events");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


