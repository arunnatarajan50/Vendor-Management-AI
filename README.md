# Vendorum – Vendor Management AI Platform

## Overview
Vendorum is a lightweight web platform that helps small and mid-sized businesses streamline vendor selection and monitoring.  
It lets a buyer upload a product catalog, receive vendor recommendations backed by evidence, create draft purchase orders, and track vendor health through alerts and scorecards.

This project was built to demonstrate **product thinking, full-stack engineering, and practical use of machine learning**.

---

## Key Features
- **CSV Import** – Upload product catalogs directly into the platform.
- **Vendor Recommendations** – Transparent scoring model combines price, lead time, quality, and category match.
- **Draft Orders** – Generate and track purchase orders from recommended vendors.
- **Health Alerts** – Background jobs surface anomalies like late shipments or stock issues.
- **Scorecards** – Vendors get clear, data-driven profiles for decision making.

---

## Architecture
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS  
- **Backend**: Node.js API routes, Prisma ORM, PostgreSQL  
- **Jobs**: Redis + BullMQ queue for health monitoring  
- **Machine Learning**: Gradient Boosted Trees exported to ONNX and served in Node via `onnxruntime`. Blends with rules-based scoring for explainability.  
- **Deployment Ready**: Dockerized and structured for Cloud Run + Cloud SQL.

---

## How It Works
1. **Import** – A buyer uploads a CSV of products.  
2. **Match** – Vendors are scored using both rule-based features and a trained ML model.  
3. **Order** – A draft purchase order is created with quantity, ETA, and vendor details.  
4. **Monitor** – A background worker flags anomalies and updates vendor scorecards in near-real time.

---

## Why It Matters
Vendor selection is usually manual, spread across emails and spreadsheets, and prone to delays. Vendorum reduces this friction:
- Cuts time-to-first-match from hours to under a minute.  
- Surfaces risks early with anomaly detection.  
- Keeps decision making transparent while layering in ML for improved accuracy.  

---

## Getting Started
```bash
# Install dependencies
npm install

# Start Postgres & Redis
docker compose up -d

# Run migrations and seed data
npx prisma migrate dev
npm run seed

# Train the ML model
npm run train

# Run the app
npm run dev
npm run worker   # in a separate terminal
