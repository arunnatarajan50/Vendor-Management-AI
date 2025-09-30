import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { FEATURE_NAMES } from "@/server/ml/features";
import { hasModel } from "@/server/ml/onnx";

export async function GET(_req: NextRequest) {
  const root = process.cwd();
  const featurePath = path.join(root, "ml", "feature_names.json");
  let featureNames: string[] = Array.from(FEATURE_NAMES);
  try {
    if (fs.existsSync(featurePath)) {
      const txt = fs.readFileSync(featurePath, "utf-8");
      const parsed = JSON.parse(txt);
      if (Array.isArray(parsed)) featureNames = parsed as string[];
    }
  } catch (_e) {
    // ignore
  }

  const present = await hasModel();
  return NextResponse.json({ hasModel: present, featureNames });
}


