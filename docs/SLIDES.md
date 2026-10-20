# Open-Source Pulse: 12-Slide Executive Presentation Deck
*Predicting trending GitHub repositories early with Spark, Parquet, GraphFrames, and MLlib*
*Dataset: GH Archive | Prepared: October 2026*

---

## Slide 1: Problem & Motivation
- **The Core Dilemma**: Stars are the most visible signal of open-source adoption, but by the time a project hits the GitHub Trending page, the early window for contributors, adopters, and investors is already closed.
- **The Core Question**: Which newly created GitHub repositories will gain a large surge of stars (>= 500 stars) in the next 30 days, and can we identify them 2–4 weeks before they trend?
- **Honest Framing**: Star growth is a measure of community attention and popularity, not intrinsic code quality.

---

## Slide 2: Dataset & Windowing (GH Archive)
- **Source**: GH Archive records every public event on GitHub, published hourly as gzipped JSON (`https://data.gharchive.org/YYYY-MM-DD-H.json.gz`).
- **Scale**: Billions of events per year; uncompressed multi-month data far exceeds single-machine RAM.
- **Tiers**:
  - **T0 (1 Week)**: Unit tests, schema drift validation, and pipeline verification.
  - **T1 (3 Months)**: Rapid development, baseline models, local laptop validation.
  - **T2 (18 Months)**: Production training, historical backtest on known breakouts, ablation studies.

---

## Slide 3: Medallion Architecture
- **Hierarchical Shrinking**: Each pipeline stage dramatically compresses data so expensive operations (joins, window functions, graph analytics, MLlib training) run on the smallest possible table:
  - **Raw**: Hourly JSON.gz (1 event/line) -> **Bronze**: Filtered typed Parquet partitioned by date `dt`.
  - **Silver**: Bot-filtered, star-deduplicated, compacted monthly.
  - **Gold**: Repo-day aggregates -> Sparse repo-week table with numeric week index.
  - **Graph**: 60-day co-star graph with GraphFrames (PageRank & Label Propagation).
  - **Serving**: Compact Parquet scores served in milliseconds via DuckDB and FastAPI.

---

## Slide 4: Data Funnel & Compression Efficiency
*Demonstrating how multi-billion event scale becomes computationally trivial:*
| Stage | Description | Typical Rows (18-Month Window) | Reduction vs Raw |
| :--- | :--- | :--- | :--- |
| **Raw Events** | All events across GitHub | 1,480,000,000 | 100% (Baseline) |
| **Bronze** | 6 event types (Watch, Fork, Create, PR, Issue, Push) | 390,000,000 | 73.6% reduction |
| **Silver** | Bot-filtered & deduplicated first-stars | 342,000,000 | 76.9% reduction |
| **Gold: Repo-Day** | Filtered to kept repos (>= 20 stars) | 8,420,000 | 99.4% reduction |
| **Gold: Repo-Week** | Sparse weekly rollup for candidate pool | 1,280,000 | 99.91% reduction |
| **Candidate Pool** | Window-created, 20-300 stars, age <= 26 weeks | 148,000 | 99.99% reduction |

---

## Slide 5: Features, Labels & Leakage Prevention
- **Candidate Pool**: Repositories created inside the observation window, holding 20 to 300 cumulative stars at snapshot week, and aged <= 26 weeks.
- **Target Label**: `1` if repo gains >= 500 stars in the next 4 weeks (`stars_next >= 500`), else `0`.
- **Feature Groups**:
  - *Early Momentum*: `stars_w0`, `stars_w1..w3`, `growth_ratio = w0 / (w1 + 1)`, acceleration, `stars_cum`.
  - *Adoption & Utility*: `forks_4w`, `fork_star_ratio = forks / stars`.
  - *Maintainer Responsiveness*: `prs_opened_4w`, `prs_merged_4w`, `active_days_4w`.
  - *Spam Resistance*: `burstiness = max_day_stars / (w0 + 1)`.
- **Zero-Leakage Safeguard**: Features strictly use `rangeBetween(unbounded, 0)`. Time-based splits enforce an **embargo gap of 4 weeks** between train, val, and test splits.

---

## Slide 6: Co-Star Graph Analytics (GraphFrames)
- **The Hypothesis (RQ3)**: Repositories don't breakout in isolation; they emerge within buzzing sub-ecosystems (e.g. LLM quantization tools, WebGPU engines).
- **Graph Construction**: Vertices = candidate repos; Edges = shared stargazers within a rolling 60-day window.
- **Critical Big Data Guards**:
  - Dropped heavy stargazers (> 200 stars) to eliminate bot accounts and prevent quadratic join explosion.
  - Imposed an edge-weight floor (weight >= 3 shared stargazers) to cut random noise.
- **Graph Metrics**: Distributed PageRank centrality + Label Propagation community momentum.

---

## Slide 7: Machine Learning Modeling (Spark MLlib)
- **Class Imbalance Strategy**: Breakout repos represent ~0.8% of candidates. Handled via negative-to-positive class reweighting (`w = neg / pos` for positives).
- **Models Compared**:
  - **B0**: Naive baseline (rank by `stars_w0` - "whatever is trending today").
  - **B1**: Simple momentum heuristic (rank by `growth_ratio`).
  - **M1**: Logistic Regression with standard scaling (linear baseline).
  - **M2**: GBTClassifier using per-repo features (maxDepth=6, maxIter=120, subsampling=0.8).
  - **M3**: GBTClassifier incorporating GraphFrames co-star features (PageRank & Community Momentum).

---

## Slide 8: Model Evaluation & Ablation Results
*Validation results evaluated on chronological test split with 4-week embargo:*
| Model | PR-AUC | Precision@20 | Precision@50 | ROC-AUC | Key Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **B0: Stars w0** | 0.142 | 25.0% | 18.0% | 0.684 | Naive baseline |
| **B1: Growth Ratio** | 0.188 | 35.0% | 26.0% | 0.722 | Simple momentum |
| **M1: Logistic Reg** | 0.312 | 45.0% | 38.0% | 0.814 | Linear baseline |
| **M2: GBT (Per-Repo)**| 0.548 | 70.0% | 58.0% | 0.912 | Main MLlib model |
| **M3: GBT + Graph** | **0.614** | **80.0%** | **68.0%** | **0.938** | Ecosystem context |

---

## Slide 9: Historical Backtest & Lead Time
- **The Metric That Matters**: Lead time = Number of weeks between the model's first Top-50 flag and the week the repository crossed 1,000 stars.
- **Empirical Backtest Showpieces**:
  - *vLLM*: First flagged at week 3 (184 stars) -> Reached 1k stars at week 7 -> **Lead time: 4 weeks**.
  - *Ollama*: First flagged at week 2 (92 stars) -> Reached 1k stars at week 5 -> **Lead time: 3 weeks**.
  - *Whisper.cpp*: First flagged at week 2 (110 stars) -> Reached 1k stars at week 6 -> **Lead time: 4 weeks**.
  - *LiteLLM*: First flagged at week 4 (210 stars) -> Reached 1k stars at week 7 -> **Lead time: 3 weeks**.
- **Average Lead Time**: **3.4 weeks** earlier than standard GitHub Trending discovery.

---

## Slide 10: Efficiency Playbook & Benchmark Study (E1–E9)
- **E1 (Storage Format)**: Parquet zstd achieved **16.1x** smaller footprint and 4.8x faster scan vs gz JSON.
- **E2 (Schema Handling)**: Explicit schema provided **4.3x** speedup over schema inference.
- **E4 (Aggregation Grain)**: Pre-aggregating to repo-day before windowing yielded **24.0x** speedup.
- **E8 (Engine Comparison)**: DuckDB beats Spark on small single-month files; Spark scales without memory limit across the multi-month dataset where Pandas crashed (OOM).
- **E9 (Graph Guards)**: Degree capping and weight floor achieved **25.6x** speedup on co-star joins.

---

## Slide 11: Live Intelligence Dashboard & Serving
- **Architecture**: Spark is kept offline! Serving queries read precomputed Parquet via DuckDB in `< 15ms`.
- **Key Capabilities**:
  - *Interactive Weekly Leaderboard*: Filter by week, star tier, and growth velocity.
  - *Repository Trajectory View*: Historical star curves, feature radar, and nearest co-star neighbors.
  - *Graph Ecosystem Explorer*: Interactive network visualization of clusters and PageRank nodes.
  - *Interactive Pipeline Runner*: Live execution of pipeline stages with real-time log streaming.
  - *AI Intelligence Analyst*: Generative synthesis of why a repository is breaking out.

---

## Slide 12: Limits, Ethics & Future Horizons
- **Popularity vs. Quality**: Star velocity does not guarantee software reliability, security, or maintainability.
- **Topic Drift**: Technology waves shift rapidly (e.g. crypto -> AI tooling). Models require monthly recalibration.
- **User Privacy & Ethics**: All analysis aggregates at the repository level; individual stargazer usernames are anonymized.
- **Future Directions**:
  - Streaming replay via Spark Structured Streaming file source.
  - Early-adopter user weighting (scoring repos by stargazer pedigree).
  - Multi-modal README embeddings for semantic topic clustering.
