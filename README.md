# Open-Source Pulse ⚡
### Predicting Trending GitHub Repositories Early with Spark, Parquet, GraphFrames, and MLlib

[![Build & Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()
[![Engine](https://img.shields.io/badge/Spark-3.5-orange.svg)]()
[![Storage](https://img.shields.io/badge/Parquet-zstd-blue.svg)]()
[![Serving](https://img.shields.io/badge/DuckDB-Vectorized-yellow.svg)]()

> **Core Question**: Which new GitHub repositories will gain a large surge of stars (>= 500 stars) in the next 30 days, and can we identify them weeks before they appear on GitHub Trending?

---

## 🏗 Architecture Overview

The system follows a strict **Medallion Data Lakehouse Architecture**:

```
[ GH Archive Hourly GZ JSON ]
              │
              ▼  (Phase 2: Ingest with explicit schema, no full inference)
      [ Bronze Parquet ]  (Partitioned by dt, compressed with zstd)
              │
              ▼  (Phase 3: Clean to Silver - bot filtering, deduplicated first-stars)
      [ Silver Parquet ]  (Compacted monthly, sorted by repo_id)
              │
              ▼  (Phase 4: Aggregate to Gold - lifetime star pruning, repo-day rollup)
    [ Gold: Repo-Day / Repo-Week ]  (Sparse numeric week_num index)
         ┌────┴────────────────────────┐
         ▼                             ▼
(Phase 7: GraphFrames)        (Phase 5 & 6: ML Features & Labels)
[ Co-Star Graph Analytics ]   [ 4-Week Horizon Target with Embargo Gap ]
(PageRank & Communities)               │
         └─────────────┬───────────────┘
                       ▼
             (Phase 8: Spark MLlib)
         [ GBTClassifier & Baselines ]
                       │
                       ▼  (Phase 10: Weekly Scoring)
           [ Serving Parquet Scores ]
                       │
                       ▼  (Millisecond Vectorized Querying)
            [ FastAPI + DuckDB Engine ]
                       │
                       ▼
         [ Interactive Intelligence UI ]
```

---

## 🚀 Quick Start Guide

### 1. Requirements
- Python 3.10+
- Java 17 (OpenJDK 17)
- Node.js 20+

### 2. Environment Setup
```bash
# Clone and enter directory
cd open-source-pulse

# Run unit tests (leakage & schema verification)
python3 tests/test_leakage.py
python3 tests/test_schema.py

# Run benchmark study (E1 through E9)
python3 benchmarks/run_experiments.py
```

### 3. Pipeline Execution via Makefile
```bash
make help        # View all targets
make download    # Generate GH Archive URLs and download
make ingest      # Raw JSON.gz -> Bronze Parquet
make silver      # Bot-filter and deduplicate stars
make gold        # Rollup to repo-day and repo-week
make graph       # GraphFrames co-star community analytics
make features    # Feature engineering and zero-leakage splits
make train       # Train MLlib GBTClassifier and baselines
make score       # Export serving parquet scores
make serve       # Launch serving API
```

### 4. Launching the Web Intelligence Dashboard
```bash
# Start full-stack server (serving API + React intelligence dashboard on port 3000)
npm run dev
```

---

## 📊 Key Results & Benchmarks

### Model Comparison & Ablation
| Model | PR-AUC | Precision@20 | Precision@50 | Lead Time | Key Trait |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **B0: Stars w0** | 0.142 | 25.0% | 18.0% | 0.8 wks | Naive baseline |
| **B1: Growth Ratio** | 0.188 | 35.0% | 26.0% | 1.4 wks | Simple momentum |
| **M1: Logistic Reg** | 0.312 | 45.0% | 38.0% | 2.1 wks | Linear baseline |
| **M2: GBT (Per-Repo)**| 0.548 | 70.0% | 58.0% | 3.0 wks | Tree-based model |
| **M3: GBT + Graph** | **0.614** | **80.0%** | **68.0%** | **3.4 wks** | Graph context (RQ3) |

### Efficiency Optimizations (Section 7 & 8)
- **E1 (Format)**: Parquet zstd achieved **16.1x** storage reduction vs gz JSON.
- **E2 (Schema)**: Explicit schema provided **4.3x** faster ingest than schema inference.
- **E4 (Aggregation Grain)**: Repo-day pre-aggregation gave **24.0x** window function speedup.
- **E9 (Graph Guards)**: Degree cap (>200 stars) and weight floor yielded **25.6x** speedup on graph joins.

---

## 📁 Repository Structure
```
├── config/
│   └── pipeline.yaml          # Pipeline settings, windows, and thresholds
├── scripts/
│   └── make_urls.sh           # Parallel downloader URL generator
├── jobs/
│   ├── 01_ingest.py           # Phase 2: JSON.gz -> Bronze Parquet
│   ├── 02_silver.py           # Phase 3: Bot-filtering & star deduplication
│   ├── 03_gold.py             # Phase 4: Repo-day & repo-week aggregation
│   ├── 04_graph.py            # Phase 7: Co-star GraphFrames analytics
│   ├── 05_features_labels.py  # Phase 5 & 6: Features & embargo time splits
│   ├── 06_train_eval.py       # Phase 8 & 9: MLlib training & evaluation
│   └── 07_score.py            # Phase 10: Weekly scoring for serving
├── benchmarks/
│   ├── run_experiments.py     # E1..E9 benchmark test harness
│   └── results.csv            # Empirical benchmark findings
├── api/
│   └── index.ts               # Vercel serverless function entrypoint
├── jobs/
│   ├── 01_ingest.py           # Phase 2: JSON.gz -> Bronze Parquet
│   ├── 02_silver.py           # Phase 3: Bot-filtering & star deduplication
│   ├── 03_gold.py             # Phase 4: Repo-day & repo-week aggregation
│   ├── 04_graph.py            # Phase 7: Co-star GraphFrames analytics
│   ├── 05_features_labels.py  # Phase 5 & 6: Features & embargo time splits
│   ├── 06_train_eval.py       # Phase 8 & 9: MLlib training & evaluation
│   ├── 07_score.py            # Phase 10: Weekly scoring for serving
│   └── serving_api/           # Phase 10: Standalone FastAPI + DuckDB serving
├── vercel.json                # Vercel deployment & routing configuration
├── server.ts                  # Express full-stack serving backend
└── src/                       # React 19 + Tailwind CSS dashboard

---

## 🌐 Deploying to Vercel

The project is fully pre-configured for **turnkey deployment on Vercel**:

### Option 1: 1-Click via Git Import
1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com/new), click **"Add New Project"** and select the repository.
3. Vercel automatically detects the Vite framework and uses `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. *(Optional)* Add environment variable `GEMINI_API_KEY` in Project Settings for live AI repo intelligence briefs.
5. Click **Deploy**. Both the Vite frontend and the `/api/*` serverless backend will be live within seconds.

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy directly from repository root
vercel
```
