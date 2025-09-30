import json
import os
import math
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

FEATURE_NAMES = [
    "catMatch",
    "priceIndex",
    "minLeadDays",
    "qualityScore",
    "productCategoryHash",
]


def sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


def djb2_hash(s: str) -> int:
    h = 5381
    for c in s:
        h = ((h << 5) + h) + ord(c)
        h &= 0xFFFFFFFF
    return abs(h)


def clamp(v: float, a: float, b: float) -> float:
    return max(a, min(b, v))


def load_data_from_db(url: str):
    import psycopg2

    conn = psycopg2.connect(url)
    products = pd.read_sql("SELECT id, category FROM \"Product\"", conn)
    vendors = pd.read_sql(
        "SELECT id, categories, \"priceIndex\", \"avgLeadDays\", \"qualityScore\" FROM \"Vendor\"",
        conn,
    )
    conn.close()

    # categories is text[]; ensure it is parsed into list
    if "categories" in vendors.columns:
        vendors["categories"] = vendors["categories"].apply(
            lambda x: list(x) if isinstance(x, (list, tuple)) else []
        )

    rows = []
    for _, p in products.iterrows():
        pcat = p["category"] or ""
        pcat_hash = (djb2_hash(pcat) % 100) / 100.0
        for _, v in vendors.iterrows():
            catMatch = 1.0 if pcat in (v["categories"] or []) else 0.0
            priceIndex = float(v["priceIndex"]) if not pd.isna(v["priceIndex"]) else 1.0
            minLeadDays = int(v["avgLeadDays"]) if not pd.isna(v["avgLeadDays"]) else 14
            qualityScore = float(v["qualityScore"]) if not pd.isna(v["qualityScore"]) else 0.7
            productCategoryHash = pcat_hash

            # synthetic label
            price_term = 1.0 - clamp((priceIndex - 1.0) / 0.4, 0.0, 1.0)
            lead_term = 1.0 - (minLeadDays / 30.0)
            noise = np.random.normal(0.0, 0.05)
            linear = 0.9 * catMatch + 0.6 * price_term + 0.5 * lead_term + 0.7 * qualityScore + noise
            label = float(sigmoid(np.array([linear]))[0])

            rows.append(
                {
                    "catMatch": catMatch,
                    "priceIndex": priceIndex,
                    "minLeadDays": minLeadDays,
                    "qualityScore": qualityScore,
                    "productCategoryHash": productCategoryHash,
                    "label": label,
                }
            )

    df = pd.DataFrame(rows)
    return df


def load_synthetic_data():
    # synthetic products/categories
    categories = ["Electronics", "Home", "Apparel", "Beauty", "Sports", "Grocery"]
    products = pd.DataFrame({"category": categories * 5})

    vendors = []
    for i in range(30):
        vendors.append(
            {
                "categories": [categories[i % len(categories)], categories[(i + 1) % len(categories)]],
                "priceIndex": 0.8 + (i % 7) * 0.06,
                "avgLeadDays": 3 + (i % 10),
                "qualityScore": 0.6 + (i % 5) * 0.08,
            }
        )
    vendors = pd.DataFrame(vendors)

    rows = []
    for _, p in products.iterrows():
        pcat = p["category"]
        pcat_hash = (djb2_hash(pcat) % 100) / 100.0
        for _, v in vendors.iterrows():
            catMatch = 1.0 if pcat in (v["categories"] or []) else 0.0
            priceIndex = float(v["priceIndex"]) if not pd.isna(v["priceIndex"]) else 1.0
            minLeadDays = int(v["avgLeadDays"]) if not pd.isna(v["avgLeadDays"]) else 14
            qualityScore = float(v["qualityScore"]) if not pd.isna(v["qualityScore"]) else 0.7
            productCategoryHash = pcat_hash

            price_term = 1.0 - clamp((priceIndex - 1.0) / 0.4, 0.0, 1.0)
            lead_term = 1.0 - (minLeadDays / 30.0)
            noise = np.random.normal(0.0, 0.05)
            linear = 0.9 * catMatch + 0.6 * price_term + 0.5 * lead_term + 0.7 * qualityScore + noise
            label = float(sigmoid(np.array([linear]))[0])

            rows.append(
                {
                    "catMatch": catMatch,
                    "priceIndex": priceIndex,
                    "minLeadDays": minLeadDays,
                    "qualityScore": qualityScore,
                    "productCategoryHash": productCategoryHash,
                    "label": label,
                }
            )

    df = pd.DataFrame(rows)
    return df


def main():
    db_url = os.environ.get("DATABASE_URL")
    if db_url:
        try:
            df = load_data_from_db(db_url)
        except Exception:
            df = load_synthetic_data()
    else:
        df = load_synthetic_data()

    X = df[FEATURE_NAMES].astype(np.float32).values
    y = df["label"].astype(np.float32).values

    model = GradientBoostingRegressor(random_state=42)
    model.fit(X, y)

    initial_type = [("input", FloatTensorType([None, len(FEATURE_NAMES)]))]
    onx = convert_sklearn(model, initial_types=initial_type)

    os.makedirs("ml", exist_ok=True)
    with open("ml/model.onnx", "wb") as f:
        f.write(onx.SerializeToString())

    with open("ml/feature_names.json", "w") as f:
        json.dump(list(FEATURE_NAMES), f)

    print("Model trained and saved to ml/model.onnx with features:", FEATURE_NAMES)


if __name__ == "__main__":
    main()




