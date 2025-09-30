import fs from "fs";
import path from "path";
import * as ort from "onnxruntime-node";
import { FEATURE_NAMES } from "./features";

let sessionPromise: Promise<ort.InferenceSession | null> | null = null;

function getModelPath(): string {
  const root = process.cwd();
  return path.join(root, "ml", "model.onnx");
}

async function loadSession(): Promise<ort.InferenceSession | null> {
  const modelPath = getModelPath();
  if (!fs.existsSync(modelPath)) return null;
  try {
    const sess = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["cpu"],
    });
    return sess;
  } catch (_e) {
    return null;
  }
}

async function getSession(): Promise<ort.InferenceSession | null> {
  if (!sessionPromise) sessionPromise = loadSession();
  return sessionPromise;
}

export async function scoreML(features: Float32Array): Promise<number> {
  if (features.length !== FEATURE_NAMES.length) {
    throw new Error(`features length ${features.length} != ${FEATURE_NAMES.length}`);
  }
  const sess = await getSession();
  if (!sess) return Number.NaN;

  const input = new ort.Tensor("float32", features, [1, FEATURE_NAMES.length]);
  const feeds: Record<string, ort.Tensor> = { input };
  try {
    const results = await sess.run(feeds);
    const first = Object.values(results)[0];
    const data = (first.data as Float32Array | number[]);
    const raw = Array.isArray(data) ? (data[0] as number) : (data as Float32Array)[0];
    const bounded = 1 / (1 + Math.exp(-raw));
    return Math.max(0, Math.min(1, bounded));
  } catch (_e) {
    return Number.NaN;
  }
}

export async function hasModel(): Promise<boolean> {
  const sess = await getSession();
  return !!sess;
}




