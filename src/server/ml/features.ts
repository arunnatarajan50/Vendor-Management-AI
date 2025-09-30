import { Product, Vendor } from "@prisma/client";

export const FEATURE_NAMES: readonly string[] = [
  "catMatch",
  "priceIndex",
  "minLeadDays",
  "qualityScore",
  "productCategoryHash",
] as const;

function djb2Hash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash = hash | 0;
  }
  return Math.abs(hash);
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function computeFeatures(product: Product, vendor: Vendor): Float32Array {
  const catMatch = vendor.categories.includes(product.category) ? 1 : 0;
  const priceIndex = vendor.priceIndex;
  const minLeadDays = vendor.avgLeadDays;
  const qualityScore = vendor.qualityScore;
  const categoryHashBucket = (djb2Hash(product.category || "") % 100) / 100;

  const features = new Float32Array([
    catMatch,
    priceIndex,
    minLeadDays,
    clamp01(qualityScore),
    categoryHashBucket,
  ]);

  return features;
}




