import { Vendor, Product } from "@prisma/client";
import { computeFeatures } from "./ml/features";
import { scoreML } from "./ml/onnx";

export type MatchEvidence = {
  categoryMatch: number; // 0 or 1
  priceComponent: number; // 0..1 (1 is best)
  leadTimeComponent: number; // 0..1 (1 is best)
  qualityComponent: number; // 0..1 (1 is best)
  weights: { category: number; price: number; lead: number; quality: number };
  // Additional hybrid evidence
  rulesScore?: number;
  mlScore?: number;
};

export function scoreVendorForProduct(
  product: Product,
  vendor: Vendor,
  weights = { category: 0.3, price: 0.3, lead: 0.2, quality: 0.2 }
) {
  const categoryMatch = vendor.categories.includes(product.category) ? 1 : 0;

  // Normalize priceIndex: 0.7..1.3 -> map to 1..0
  const clampedPrice = Math.max(0.7, Math.min(1.3, vendor.priceIndex));
  const priceComponent = 1 - (clampedPrice - 0.7) / (1.3 - 0.7);

  // Normalize lead time: 2..21 days -> 1..0
  const leadDays = Math.max(2, Math.min(21, vendor.avgLeadDays));
  const leadTimeComponent = 1 - (leadDays - 2) / (21 - 2);

  // Quality already 0..1
  const qualityComponent = Math.max(0, Math.min(1, vendor.qualityScore));

  const score =
    weights.category * categoryMatch +
    weights.price * priceComponent +
    weights.lead * leadTimeComponent +
    weights.quality * qualityComponent;

  const evidence: MatchEvidence = {
    categoryMatch,
    priceComponent,
    leadTimeComponent,
    qualityComponent,
    weights,
  };

  return { score, evidence };
}

export async function scoreVendorForProductAsync(
  product: Product,
  vendor: Vendor,
  weights = { category: 0.3, price: 0.3, lead: 0.2, quality: 0.2 }
) {
  const { score: rulesScore, evidence } = scoreVendorForProduct(product, vendor, weights);

  const features = computeFeatures(product, vendor);
  const ml = await scoreML(features);

  const final = Number.isNaN(ml) ? rulesScore : (0.7 * ml + 0.3 * rulesScore);
  const hybridEvidence: MatchEvidence = {
    ...evidence,
    rulesScore,
    mlScore: Number.isNaN(ml) ? undefined : ml,
  };

  return { score: final, evidence: hybridEvidence };
}


