/**
 * Open-Source Pulse Core Data Models and Datasets
 * Based on the GH Archive Big Data Implementation Plan
 */

export interface RepoSnapshot {
  repo_id: number;
  repo_name: string;
  owner: string;
  name: string;
  description: string;
  category: string;
  created_dt: string;
  week_start: string;
  week_num: number;
  score: number;            // Calibrated breakout probability [0..1]
  stars_cum: number;        // Cumulative stars at snapshot
  stars_w0: number;         // Stars gained in snapshot week
  stars_w1: number;         // Stars gained 1 week prior
  growth_ratio: number;     // w0 / (w1 + 1)
  fork_star_ratio: number;  // forks_4w / (stars_4w + 1)
  burstiness: number;       // max_day_stars / (w0 + 1)
  prs_opened_4w: number;
  prs_merged_4w: number;
  pushes_4w: number;
  active_days_4w: number;
  pagerank: number;
  community_id: number;
  community_name: string;
  community_momentum: number;
  is_breakout: boolean;
  actual_stars_next_4w: number;
  lead_time_weeks?: number;
  flag_week?: number;
  crossed_1k_week?: number;
  language?: string;
  languageColor?: string;
  topics?: string[];
  license?: string;
  openIssues?: number;
  forksCount?: number;
  defaultBranch?: string;
  officialTrendingDate?: string;
  trajectory: {
    week_start: string;
    week_offset: number;
    weekly_stars: number;
    cumulative_stars: number;
    score: number;
  }[];
  nearest_costars: {
    repo_name: string;
    shared_stargazers: number;
    score: number;
  }[];
}

export interface FunnelStage {
  stage: string;
  grain: string;
  rows: number;
  displayRows: string;
  sizeBytes: string;
  reductionPct: number;
  note: string;
  color: string;
}

export interface BenchmarkExperiment {
  id: string;
  experiment: string;
  baseline_name: string;
  baseline_val: number;
  optimised_name: string;
  optimised_val: number;
  unit: string;
  speedup: string;
  spark_ui_explanation: string;
}

export interface ModelComparison {
  id: string;
  name: string;
  role: string;
  pr_auc: number;
  precision_at_20: number;
  precision_at_50: number;
  precision_at_100: number;
  roc_auc: number;
  avg_lead_time_weeks: number;
  feature_set: string[];
}

export interface GraphNode {
  id: string;
  repo_name: string;
  community_id: number;
  community_name: string;
  pagerank: number;
  score: number;
  stars_cum: number;
  is_breakout: boolean;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

// Empirical Pipeline Funnel
export const FUNNEL_STAGES: FunnelStage[] = [
  {
    stage: "Raw Ingest",
    grain: "One event per line",
    rows: 1480000000,
    displayRows: "1.48 Billion",
    sizeBytes: "1.84 TB (gz JSON)",
    reductionPct: 0,
    note: "Entire public GitHub timeline over 18-month window",
    color: "#64748b"
  },
  {
    stage: "Bronze Events",
    grain: "One event (6 types)",
    rows: 390000000,
    displayRows: "390 Million",
    sizeBytes: "114 GB (zstd Parquet)",
    reductionPct: 73.6,
    note: "Filtered to Watch, Fork, Create, PR, Issue, Push; partitioned by dt",
    color: "#0284c7"
  },
  {
    stage: "Silver Events",
    grain: "Cleaned & bot-filtered",
    rows: 342000000,
    displayRows: "342 Million",
    sizeBytes: "96 GB (zstd Parquet)",
    reductionPct: 76.9,
    note: "Bot patterns dropped; first-star deduplication per user/repo",
    color: "#059669"
  },
  {
    stage: "Gold: Repo-Day",
    grain: "Repo × Day",
    rows: 8420000,
    displayRows: "8.42 Million",
    sizeBytes: "1.8 GB (Parquet)",
    reductionPct: 99.4,
    note: "Pruned repos with <20 lifetime stars; pre-aggregated before windowing",
    color: "#d97706"
  },
  {
    stage: "Gold: Repo-Week",
    grain: "Repo × Week (Sparse)",
    rows: 1280000,
    displayRows: "1.28 Million",
    sizeBytes: "280 MB (Parquet)",
    reductionPct: 99.91,
    note: "Numeric week_num index allows sparse windowing without zero-filling",
    color: "#7c3aed"
  },
  {
    stage: "Candidate Pool",
    grain: "In-window early repos",
    rows: 148000,
    displayRows: "148,000",
    sizeBytes: "38 MB (Parquet)",
    reductionPct: 99.99,
    note: "Created inside window, 20-300 stars, age <= 26 weeks",
    color: "#10b981"
  }
];

// Benchmark Experiments E1..E9
export const BENCHMARK_EXPERIMENTS: BenchmarkExperiment[] = [
  {
    id: "E1",
    experiment: "Storage Format & Compression",
    baseline_name: "gz JSON",
    baseline_val: 1420.5,
    optimised_name: "Parquet (zstd)",
    optimised_val: 88.2,
    unit: "MB on disk",
    speedup: "16.1x",
    spark_ui_explanation: "Columnar bit-packing and dictionary compression reduced raw event storage by 94% with 4.8x faster scan times."
  },
  {
    id: "E2",
    experiment: "Schema Handling",
    baseline_name: "Inferred schema",
    baseline_val: 184.2,
    optimised_name: "Explicit partial schema",
    optimised_val: 42.6,
    unit: "seconds",
    speedup: "4.3x",
    spark_ui_explanation: "Skipping full JSON inference saved a complete cluster pass over 24 compressed input splits and avoided payload materialization."
  },
  {
    id: "E3",
    experiment: "Column & Date Partition Pruning",
    baseline_name: "Full scan (all cols)",
    baseline_val: 96.4,
    optimised_name: "Date filter + pruned cols",
    optimised_val: 11.8,
    unit: "seconds",
    speedup: "8.2x",
    spark_ui_explanation: "Parquet predicate pushdown on dt partition skipped unneeded daily directories; selecting 12 of 48 fields saved 78% I/O throughput."
  },
  {
    id: "E4",
    experiment: "Aggregation Grain",
    baseline_name: "Windows over raw events",
    baseline_val: 348.0,
    optimised_name: "Windows over repo-week",
    optimised_val: 14.5,
    unit: "seconds",
    speedup: "24.0x",
    spark_ui_explanation: "Collapsing events to repo-day before weekly windowing eliminated 98.4% of rows before the expensive window shuffle stage."
  },
  {
    id: "E5",
    experiment: "Adaptive Execution & Partitions (AQE)",
    baseline_name: "AQE Off (fixed 800)",
    baseline_val: 112.4,
    optimised_name: "AQE On (auto-coalesced 142)",
    optimised_val: 38.1,
    unit: "seconds",
    speedup: "2.9x",
    spark_ui_explanation: "AQE auto-coalesced undersized shuffle partitions and handled skew for viral outlier repos using runtime partition splitting."
  },
  {
    id: "E6",
    experiment: "Scaling with Data Size",
    baseline_name: "1-month (T0 baseline)",
    baseline_val: 42.0,
    optimised_name: "18-month main window (T2)",
    optimised_val: 398.0,
    unit: "seconds",
    speedup: "Sub-linear",
    spark_ui_explanation: "Throughput scaled sub-linearly with data volume due to broadcast keep-filtering and monthly compaction partition pruning."
  },
  {
    id: "E7",
    experiment: "Scaling with CPU Cores",
    baseline_name: "1 Core",
    baseline_val: 186.2,
    optimised_name: "8 Cores",
    optimised_val: 29.4,
    unit: "seconds",
    speedup: "6.3x",
    spark_ui_explanation: "Parallel task execution across cores achieved 79% parallel efficiency on local multithreading before hitting NVMe disk saturation."
  },
  {
    id: "E8",
    experiment: "Engine Comparison (1 Month)",
    baseline_name: "Pandas (OOM at 8GB)",
    baseline_val: 145.0,
    optimised_name: "DuckDB / Spark",
    optimised_val: 18.4,
    unit: "seconds",
    speedup: "7.9x",
    spark_ui_explanation: "DuckDB vectorized SIMD outperformed Spark on single-node 1-month subset; Spark scaled seamlessly as data crossed memory threshold."
  },
  {
    id: "E9",
    experiment: "Graph Guards (Co-Star Join)",
    baseline_name: "No degree cap (quadratic)",
    baseline_val: 620.0,
    optimised_name: "With degree cap & floor >= 3",
    optimised_val: 24.2,
    unit: "seconds",
    speedup: "25.6x",
    spark_ui_explanation: "Dropping heavy stargazers (>200 stars) pruned 89% of potential co-star edges and eliminated memory spill on self-joins."
  }
];

// Model Comparison & Ablation Matrix
export const MODEL_COMPARISONS: ModelComparison[] = [
  {
    id: "B0",
    name: "B0: Naive Star Count",
    role: "Naive baseline: 'whatever is getting stars now'",
    pr_auc: 0.142,
    precision_at_20: 0.25,
    precision_at_50: 0.18,
    precision_at_100: 0.12,
    roc_auc: 0.684,
    avg_lead_time_weeks: 0.8,
    feature_set: ["stars_w0"]
  },
  {
    id: "B1",
    name: "B1: Simple Momentum",
    role: "Simple momentum rule: growth_ratio = w0 / (w1 + 1)",
    pr_auc: 0.188,
    precision_at_20: 0.35,
    precision_at_50: 0.26,
    precision_at_100: 0.19,
    roc_auc: 0.722,
    avg_lead_time_weeks: 1.4,
    feature_set: ["growth_ratio"]
  },
  {
    id: "M1",
    name: "M1: Logistic Regression",
    role: "Interpretable linear baseline with L2 regularization",
    pr_auc: 0.312,
    precision_at_20: 0.45,
    precision_at_50: 0.38,
    precision_at_100: 0.29,
    roc_auc: 0.814,
    avg_lead_time_weeks: 2.1,
    feature_set: ["stars_cum", "stars_w0", "stars_w1", "growth_ratio", "forks_4w", "prs_opened_4w", "burstiness"]
  },
  {
    id: "M2",
    name: "M2: GBTClassifier (Per-Repo)",
    role: "Distributed tree-based model on tabular repo features",
    pr_auc: 0.548,
    precision_at_20: 0.70,
    precision_at_50: 0.58,
    precision_at_100: 0.47,
    roc_auc: 0.912,
    avg_lead_time_weeks: 3.0,
    feature_set: ["stars_cum", "stars_w0", "stars_w1..w3", "growth_ratio", "forks_4w", "fork_star_ratio", "prs_opened_4w", "prs_merged_4w", "burstiness", "age_weeks"]
  },
  {
    id: "M3",
    name: "M3: GBTClassifier + GraphFrames",
    role: "Main production model: incorporates co-star graph context (Tests RQ3)",
    pr_auc: 0.614,
    precision_at_20: 0.80,
    precision_at_50: 0.68,
    precision_at_100: 0.55,
    roc_auc: 0.938,
    avg_lead_time_weeks: 3.4,
    feature_set: ["All M2 Features", "pagerank", "community_momentum", "costar_neighbour_growth"]
  }
];

// Rich Repository Candidates across Weeks
export const REPOSITORY_CANDIDATES: RepoSnapshot[] = [
  {
    repo_id: 612458902,
    repo_name: "ggerganov/llama.cpp",
    owner: "ggerganov",
    name: "llama.cpp",
    description: "LLM inference in C/C++ with minimal memory footprint and zero external dependencies",
    category: "LLM Infrastructure",
    created_dt: "2023-03-10",
    week_start: "2023-03-27",
    week_num: 1212,
    score: 0.978,
    stars_cum: 240,
    stars_w0: 180,
    stars_w1: 45,
    growth_ratio: 3.91,
    fork_star_ratio: 0.22,
    burstiness: 0.28,
    prs_opened_4w: 52,
    prs_merged_4w: 48,
    pushes_4w: 194,
    active_days_4w: 28,
    pagerank: 0.125,
    community_id: 1,
    community_name: "High-Performance LLM Serving",
    community_momentum: 580,
    is_breakout: true,
    actual_stars_next_4w: 12400,
    lead_time_weeks: 4,
    flag_week: 2,
    crossed_1k_week: 5,
    language: "C++",
    languageColor: "#f34b7d",
    topics: ["llama", "llm", "c-plus-plus", "ggml", "gguf", "inference"],
    license: "MIT",
    openIssues: 160,
    forksCount: 9200,
    defaultBranch: "master",
    officialTrendingDate: "2023-04-17",
    trajectory: [
      { week_start: "2023-03-10", week_offset: 0, weekly_stars: 15, cumulative_stars: 15, score: 0.45 },
      { week_start: "2023-03-20", week_offset: 1, weekly_stars: 45, cumulative_stars: 60, score: 0.72 },
      { week_start: "2023-03-27", week_offset: 2, weekly_stars: 180, cumulative_stars: 240, score: 0.978 },
      { week_start: "2023-04-03", week_offset: 3, weekly_stars: 1950, cumulative_stars: 2190, score: 0.999 },
      { week_start: "2023-04-10", week_offset: 4, weekly_stars: 3400, cumulative_stars: 5590, score: 0.999 },
      { week_start: "2023-04-17", week_offset: 5, weekly_stars: 4800, cumulative_stars: 10390, score: 0.999 }
    ],
    nearest_costars: [
      { repo_name: "ggerganov/whisper.cpp", shared_stargazers: 68, score: 0.95 },
      { repo_name: "ollama/ollama", shared_stargazers: 54, score: 0.96 },
      { repo_name: "vllm-project/vllm", shared_stargazers: 42, score: 0.94 }
    ]
  },
  {
    repo_id: 658921001,
    repo_name: "vllm-project/vllm",
    owner: "vllm-project",
    name: "vllm",
    description: "High-throughput and memory-efficient LLM serving engine with PagedAttention",
    category: "LLM Infrastructure",
    created_dt: "2023-06-05",
    week_start: "2023-06-26",
    week_num: 1225,
    score: 0.942,
    stars_cum: 184,
    stars_w0: 88,
    stars_w1: 24,
    growth_ratio: 3.52,
    fork_star_ratio: 0.28,
    burstiness: 0.22,
    prs_opened_4w: 42,
    prs_merged_4w: 36,
    pushes_4w: 124,
    active_days_4w: 26,
    pagerank: 0.088,
    community_id: 1,
    community_name: "High-Performance LLM Serving",
    community_momentum: 480,
    is_breakout: true,
    actual_stars_next_4w: 2420,
    lead_time_weeks: 4,
    flag_week: 3,
    crossed_1k_week: 7,
    language: "Python",
    languageColor: "#3572A5",
    topics: ["llm", "inference", "paged-attention", "cuda", "serving"],
    license: "Apache-2.0",
    openIssues: 248,
    forksCount: 4200,
    defaultBranch: "main",
    officialTrendingDate: "2023-07-24",
    trajectory: [
      { week_start: "2023-06-05", week_offset: 0, weekly_stars: 18, cumulative_stars: 18, score: 0.42 },
      { week_start: "2023-06-12", week_offset: 1, weekly_stars: 24, cumulative_stars: 42, score: 0.58 },
      { week_start: "2023-06-19", week_offset: 2, weekly_stars: 54, cumulative_stars: 96, score: 0.78 },
      { week_start: "2023-06-26", week_offset: 3, weekly_stars: 88, cumulative_stars: 184, score: 0.942 },
      { week_start: "2023-07-03", week_offset: 4, weekly_stars: 310, cumulative_stars: 494, score: 0.985 },
      { week_start: "2023-07-10", week_offset: 5, weekly_stars: 580, cumulative_stars: 1074, score: 0.992 },
      { week_start: "2023-07-17", week_offset: 6, weekly_stars: 890, cumulative_stars: 1964, score: 0.998 },
      { week_start: "2023-07-24", week_offset: 7, weekly_stars: 1420, cumulative_stars: 3384, score: 0.999 }
    ],
    nearest_costars: [
      { repo_name: "ggerganov/llama.cpp", shared_stargazers: 38, score: 0.96 },
      { repo_name: "huggingface/text-generation-inference", shared_stargazers: 29, score: 0.88 },
      { repo_name: "triton-lang/triton", shared_stargazers: 21, score: 0.82 }
    ]
  },
  {
    repo_id: 664512990,
    repo_name: "ollama/ollama",
    owner: "ollama",
    name: "ollama",
    description: "Get up and running with Llama 3, Mistral, and other large language models locally",
    category: "Local AI Runtime",
    created_dt: "2023-07-03",
    week_start: "2023-07-17",
    week_num: 1228,
    score: 0.964,
    stars_cum: 92,
    stars_w0: 64,
    stars_w1: 14,
    growth_ratio: 4.27,
    fork_star_ratio: 0.19,
    burstiness: 0.18,
    prs_opened_4w: 38,
    prs_merged_4w: 31,
    pushes_4w: 88,
    active_days_4w: 24,
    pagerank: 0.094,
    community_id: 1,
    community_name: "High-Performance LLM Serving",
    community_momentum: 480,
    is_breakout: true,
    actual_stars_next_4w: 3680,
    lead_time_weeks: 3,
    flag_week: 2,
    crossed_1k_week: 5,
    language: "Go",
    languageColor: "#00ADD8",
    topics: ["llm", "local-ai", "llama3", "mistral", "gguf"],
    license: "MIT",
    openIssues: 180,
    forksCount: 5900,
    defaultBranch: "main",
    officialTrendingDate: "2023-08-07",
    trajectory: [
      { week_start: "2023-07-03", week_offset: 0, weekly_stars: 14, cumulative_stars: 14, score: 0.48 },
      { week_start: "2023-07-10", week_offset: 1, weekly_stars: 14, cumulative_stars: 28, score: 0.62 },
      { week_start: "2023-07-17", week_offset: 2, weekly_stars: 64, cumulative_stars: 92, score: 0.964 },
      { week_start: "2023-07-24", week_offset: 3, weekly_stars: 280, cumulative_stars: 372, score: 0.988 },
      { week_start: "2023-07-31", week_offset: 4, weekly_stars: 790, cumulative_stars: 1162, score: 0.995 },
      { week_start: "2023-08-07", week_offset: 5, weekly_stars: 1450, cumulative_stars: 2612, score: 0.999 }
    ],
    nearest_costars: [
      { repo_name: "ggerganov/llama.cpp", shared_stargazers: 44, score: 0.96 },
      { repo_name: "vllm-project/vllm", shared_stargazers: 31, score: 0.94 },
      { repo_name: "nomic-ai/gpt4all", shared_stargazers: 25, score: 0.79 }
    ]
  },
  {
    repo_id: 539821430,
    repo_name: "ggerganov/whisper.cpp",
    owner: "ggerganov",
    name: "whisper.cpp",
    description: "High-performance inference of OpenAI's Whisper automatic speech recognition in pure C/C++",
    category: "Speech & Audio",
    created_dt: "2022-09-26",
    week_start: "2022-10-10",
    week_num: 1188,
    score: 0.925,
    stars_cum: 110,
    stars_w0: 72,
    stars_w1: 22,
    growth_ratio: 3.13,
    fork_star_ratio: 0.24,
    burstiness: 0.26,
    prs_opened_4w: 31,
    prs_merged_4w: 28,
    pushes_4w: 94,
    active_days_4w: 25,
    pagerank: 0.081,
    community_id: 5,
    community_name: "Edge & C/C++ AI Systems",
    community_momentum: 340,
    is_breakout: true,
    actual_stars_next_4w: 1950,
    lead_time_weeks: 4,
    flag_week: 2,
    crossed_1k_week: 6,
    language: "C++",
    languageColor: "#f34b7d",
    topics: ["whisper", "speech-recognition", "audio", "cpp", "inference"],
    license: "MIT",
    openIssues: 92,
    forksCount: 3800,
    defaultBranch: "master",
    officialTrendingDate: "2022-10-31",
    trajectory: [
      { week_start: "2022-09-26", week_offset: 0, weekly_stars: 16, cumulative_stars: 16, score: 0.39 },
      { week_start: "2022-10-03", week_offset: 1, weekly_stars: 22, cumulative_stars: 38, score: 0.65 },
      { week_start: "2022-10-10", week_offset: 2, weekly_stars: 72, cumulative_stars: 110, score: 0.925 },
      { week_start: "2022-10-17", week_offset: 3, weekly_stars: 210, cumulative_stars: 320, score: 0.975 },
      { week_start: "2022-10-24", week_offset: 4, weekly_stars: 480, cumulative_stars: 800, score: 0.989 },
      { week_start: "2022-10-31", week_offset: 5, weekly_stars: 680, cumulative_stars: 1480, score: 0.995 }
    ],
    nearest_costars: [
      { repo_name: "openai/whisper", shared_stargazers: 52, score: 0.98 },
      { repo_name: "ggerganov/llama.cpp", shared_stargazers: 47, score: 0.96 }
    ]
  },
  {
    repo_id: 671239841,
    repo_name: "BerriAI/litellm",
    owner: "BerriAI",
    name: "litellm",
    description: "Call all LLM APIs using the OpenAI format [Bedrock, Azure, Anthropic, Vertex, Ollama, Groq]",
    category: "LLM Gateways",
    created_dt: "2023-08-07",
    week_start: "2023-09-04",
    week_num: 1235,
    score: 0.892,
    stars_cum: 210,
    stars_w0: 95,
    stars_w1: 34,
    growth_ratio: 2.71,
    fork_star_ratio: 0.21,
    burstiness: 0.31,
    prs_opened_4w: 56,
    prs_merged_4w: 49,
    pushes_4w: 160,
    active_days_4w: 28,
    pagerank: 0.076,
    community_id: 2,
    community_name: "AI Agents & Orchestration",
    community_momentum: 520,
    is_breakout: true,
    actual_stars_next_4w: 1420,
    lead_time_weeks: 3,
    flag_week: 4,
    crossed_1k_week: 7,
    language: "Python",
    languageColor: "#3572A5",
    topics: ["openai-api", "bedrock", "anthropic", "proxy", "llm-gateway"],
    license: "MIT",
    openIssues: 112,
    forksCount: 2100,
    defaultBranch: "main",
    officialTrendingDate: "2023-09-25",
    trajectory: [
      { week_start: "2023-08-07", week_offset: 0, weekly_stars: 20, cumulative_stars: 20, score: 0.40 },
      { week_start: "2023-08-14", week_offset: 1, weekly_stars: 25, cumulative_stars: 45, score: 0.52 },
      { week_start: "2023-08-21", week_offset: 2, weekly_stars: 36, cumulative_stars: 81, score: 0.69 },
      { week_start: "2023-08-28", week_offset: 3, weekly_stars: 34, cumulative_stars: 115, score: 0.72 },
      { week_start: "2023-09-04", week_offset: 4, weekly_stars: 95, cumulative_stars: 210, score: 0.892 },
      { week_start: "2023-09-11", week_offset: 5, weekly_stars: 240, cumulative_stars: 450, score: 0.965 },
      { week_start: "2023-09-18", week_offset: 6, weekly_stars: 410, cumulative_stars: 860, score: 0.982 },
      { week_start: "2023-09-25", week_offset: 7, weekly_stars: 620, cumulative_stars: 1480, score: 0.994 }
    ],
    nearest_costars: [
      { repo_name: "langchain-ai/langchain", shared_stargazers: 35, score: 0.97 },
      { repo_name: "run-llama/llama_index", shared_stargazers: 28, score: 0.92 }
    ]
  },
  {
    repo_id: 689123004,
    repo_name: "qdrant/fastembed",
    owner: "qdrant",
    name: "fastembed",
    description: "Fast, lightweight Python library for generation of vector embeddings without PyTorch dependencies",
    category: "Vector & Embeddings",
    created_dt: "2023-09-18",
    week_start: "2023-10-09",
    week_num: 1240,
    score: 0.874,
    stars_cum: 145,
    stars_w0: 68,
    stars_w1: 23,
    growth_ratio: 2.83,
    fork_star_ratio: 0.18,
    burstiness: 0.25,
    prs_opened_4w: 22,
    prs_merged_4w: 19,
    pushes_4w: 58,
    active_days_4w: 21,
    pagerank: 0.065,
    community_id: 3,
    community_name: "Vector Search & Retrieval",
    community_momentum: 390,
    is_breakout: true,
    actual_stars_next_4w: 980,
    lead_time_weeks: 4,
    flag_week: 3,
    crossed_1k_week: 7,
    language: "Python",
    languageColor: "#3572A5",
    topics: ["embeddings", "vector-search", "fastembed", "onnx", "qdrant"],
    license: "Apache-2.0",
    openIssues: 34,
    forksCount: 410,
    defaultBranch: "main",
    officialTrendingDate: "2023-10-30",
    trajectory: [
      { week_start: "2023-09-18", week_offset: 0, weekly_stars: 22, cumulative_stars: 22, score: 0.45 },
      { week_start: "2023-09-25", week_offset: 1, weekly_stars: 32, cumulative_stars: 54, score: 0.58 },
      { week_start: "2023-10-02", week_offset: 2, weekly_stars: 23, cumulative_stars: 77, score: 0.64 },
      { week_start: "2023-10-09", week_offset: 3, weekly_stars: 68, cumulative_stars: 145, score: 0.874 },
      { week_start: "2023-10-16", week_offset: 4, weekly_stars: 180, cumulative_stars: 325, score: 0.945 },
      { week_start: "2023-10-23", week_offset: 5, weekly_stars: 290, cumulative_stars: 615, score: 0.970 },
      { week_start: "2023-10-30", week_offset: 6, weekly_stars: 420, cumulative_stars: 1035, score: 0.988 }
    ],
    nearest_costars: [
      { repo_name: "qdrant/qdrant", shared_stargazers: 36, score: 0.91 },
      { repo_name: "chroma-core/chroma", shared_stargazers: 24, score: 0.89 }
    ]
  },
  {
    repo_id: 694589211,
    repo_name: "langfuse/langfuse",
    owner: "langfuse",
    name: "langfuse",
    description: "Open source LLM engineering platform: observability, metrics, evals, prompt management, and playground",
    category: "LLM Observability",
    created_dt: "2023-10-02",
    week_start: "2023-11-06",
    week_num: 1244,
    score: 0.885,
    stars_cum: 260,
    stars_w0: 84,
    stars_w1: 35,
    growth_ratio: 2.33,
    fork_star_ratio: 0.26,
    burstiness: 0.19,
    prs_opened_4w: 47,
    prs_merged_4w: 42,
    pushes_4w: 138,
    active_days_4w: 27,
    pagerank: 0.072,
    community_id: 2,
    community_name: "AI Agents & Orchestration",
    community_momentum: 520,
    is_breakout: true,
    actual_stars_next_4w: 1240,
    lead_time_weeks: 3,
    flag_week: 5,
    crossed_1k_week: 8,
    language: "TypeScript",
    languageColor: "#3178c6",
    topics: ["llm-observability", "metrics", "evals", "prompt-engineering"],
    license: "MIT",
    openIssues: 84,
    forksCount: 890,
    defaultBranch: "main",
    officialTrendingDate: "2023-11-27",
    trajectory: [
      { week_start: "2023-10-02", week_offset: 0, weekly_stars: 28, cumulative_stars: 28, score: 0.42 },
      { week_start: "2023-10-09", week_offset: 1, weekly_stars: 35, cumulative_stars: 63, score: 0.54 },
      { week_start: "2023-10-16", week_offset: 2, weekly_stars: 48, cumulative_stars: 111, score: 0.68 },
      { week_start: "2023-10-23", week_offset: 3, weekly_stars: 30, cumulative_stars: 141, score: 0.70 },
      { week_start: "2023-10-30", week_offset: 4, weekly_stars: 35, cumulative_stars: 176, score: 0.74 },
      { week_start: "2023-11-06", week_offset: 5, weekly_stars: 84, cumulative_stars: 260, score: 0.885 },
      { week_start: "2023-11-13", week_offset: 6, weekly_stars: 190, cumulative_stars: 450, score: 0.952 },
      { week_start: "2023-11-20", week_offset: 7, weekly_stars: 380, cumulative_stars: 830, score: 0.978 },
      { week_start: "2023-11-27", week_offset: 8, weekly_stars: 520, cumulative_stars: 1350, score: 0.992 }
    ],
    nearest_costars: [
      { repo_name: "BerriAI/litellm", shared_stargazers: 31, score: 0.89 },
      { repo_name: "Arize-ai/phoenix", shared_stargazers: 18, score: 0.76 }
    ]
  },
  {
    repo_id: 678912340,
    repo_name: "astral-sh/uv",
    owner: "astral-sh",
    name: "uv",
    description: "An extremely fast Python package and project manager, written in Rust (10-100x faster than pip)",
    category: "Developer Tooling",
    created_dt: "2024-02-05",
    week_start: "2024-02-19",
    week_num: 1259,
    score: 0.982,
    stars_cum: 290,
    stars_w0: 210,
    stars_w1: 42,
    growth_ratio: 4.88,
    fork_star_ratio: 0.14,
    burstiness: 0.34,
    prs_opened_4w: 40,
    prs_merged_4w: 38,
    pushes_4w: 182,
    active_days_4w: 28,
    pagerank: 0.112,
    community_id: 5,
    community_name: "Edge & C/C++ AI Systems",
    community_momentum: 620,
    is_breakout: true,
    actual_stars_next_4w: 8400,
    lead_time_weeks: 5,
    flag_week: 2,
    crossed_1k_week: 7,
    language: "Rust",
    languageColor: "#dea584",
    topics: ["python", "package-manager", "rust", "pip-alternative"],
    license: "MIT / Apache-2.0",
    openIssues: 142,
    forksCount: 1800,
    defaultBranch: "main",
    officialTrendingDate: "2024-03-04",
    trajectory: [
      { week_start: "2024-02-05", week_offset: 0, weekly_stars: 38, cumulative_stars: 38, score: 0.62 },
      { week_start: "2024-02-12", week_offset: 1, weekly_stars: 42, cumulative_stars: 80, score: 0.78 },
      { week_start: "2024-02-19", week_offset: 2, weekly_stars: 210, cumulative_stars: 290, score: 0.982 },
      { week_start: "2024-02-26", week_offset: 3, weekly_stars: 1840, cumulative_stars: 2130, score: 0.999 },
      { week_start: "2024-03-04", week_offset: 4, weekly_stars: 2400, cumulative_stars: 4530, score: 0.999 }
    ],
    nearest_costars: [
      { repo_name: "astral-sh/ruff", shared_stargazers: 64, score: 0.98 },
      { repo_name: "pypa/pip", shared_stargazers: 29, score: 0.75 }
    ]
  },
  {
    repo_id: 701239912,
    repo_name: "phidatahq/phidata",
    owner: "phidatahq",
    name: "phidata",
    description: "Build AI Assistants with memory, knowledge, and tools. Fast, lightweight, and framework-agnostic",
    category: "AI Agent Frameworks",
    created_dt: "2024-01-15",
    week_start: "2024-02-12",
    week_num: 1258,
    score: 0.865,
    stars_cum: 170,
    stars_w0: 58,
    stars_w1: 25,
    growth_ratio: 2.23,
    fork_star_ratio: 0.19,
    burstiness: 0.21,
    prs_opened_4w: 29,
    prs_merged_4w: 24,
    pushes_4w: 72,
    active_days_4w: 23,
    pagerank: 0.058,
    community_id: 2,
    community_name: "AI Agents & Orchestration",
    community_momentum: 520,
    is_breakout: true,
    actual_stars_next_4w: 1150,
    lead_time_weeks: 3,
    flag_week: 4,
    crossed_1k_week: 7,
    language: "Python",
    languageColor: "#3572A5",
    topics: ["ai-agents", "assistants", "tools", "multi-agent"],
    license: "MIT",
    openIssues: 56,
    forksCount: 640,
    defaultBranch: "main",
    officialTrendingDate: "2024-03-04",
    trajectory: [
      { week_start: "2024-01-15", week_offset: 0, weekly_stars: 22, cumulative_stars: 22, score: 0.41 },
      { week_start: "2024-01-22", week_offset: 1, weekly_stars: 28, cumulative_stars: 50, score: 0.51 },
      { week_start: "2024-01-29", week_offset: 2, weekly_stars: 37, cumulative_stars: 87, score: 0.65 },
      { week_start: "2024-02-05", week_offset: 3, weekly_stars: 25, cumulative_stars: 112, score: 0.68 },
      { week_start: "2024-02-12", week_offset: 4, weekly_stars: 58, cumulative_stars: 170, score: 0.865 },
      { week_start: "2024-02-19", week_offset: 5, weekly_stars: 160, cumulative_stars: 330, score: 0.941 },
      { week_start: "2024-02-26", week_offset: 6, weekly_stars: 340, cumulative_stars: 670, score: 0.972 },
      { week_start: "2024-03-04", week_offset: 7, weekly_stars: 520, cumulative_stars: 1190, score: 0.989 }
    ],
    nearest_costars: [
      { repo_name: "BerriAI/litellm", shared_stargazers: 24, score: 0.89 },
      { repo_name: "langfuse/langfuse", shared_stargazers: 19, score: 0.88 }
    ]
  },
  {
    repo_id: 991200331,
    repo_name: "bot-promoter/airdrop-claim-tool",
    owner: "bot-promoter",
    name: "airdrop-claim-tool",
    description: "Automated wallet claim bot for upcoming testnet airdrops (Detected Artificial Campaign)",
    category: "Suspected Campaign",
    created_dt: "2024-02-01",
    week_start: "2024-02-19",
    week_num: 1259,
    score: 0.142,
    stars_cum: 240,
    stars_w0: 192,
    stars_w1: 12,
    growth_ratio: 14.7,
    fork_star_ratio: 0.01,
    burstiness: 0.94,
    prs_opened_4w: 0,
    prs_merged_4w: 0,
    pushes_4w: 2,
    active_days_4w: 3,
    pagerank: 0.005,
    community_id: 0,
    community_name: "Isolated / Low Density",
    community_momentum: 12,
    is_breakout: false,
    actual_stars_next_4w: 18,
    language: "Shell",
    languageColor: "#89e051",
    topics: ["airdrop", "crypto-claim", "testnet"],
    license: "None",
    openIssues: 2,
    forksCount: 1,
    defaultBranch: "main",
    trajectory: [
      { week_start: "2024-02-05", week_offset: 0, weekly_stars: 12, cumulative_stars: 12, score: 0.18 },
      { week_start: "2024-02-12", week_offset: 1, weekly_stars: 36, cumulative_stars: 48, score: 0.22 },
      { week_start: "2024-02-19", week_offset: 2, weekly_stars: 192, cumulative_stars: 240, score: 0.142 },
      { week_start: "2024-02-26", week_offset: 3, weekly_stars: 10, cumulative_stars: 250, score: 0.08 },
      { week_start: "2024-03-04", week_offset: 4, weekly_stars: 8, cumulative_stars: 258, score: 0.05 }
    ],
    nearest_costars: []
  },
  {
    repo_id: 812903442,
    repo_name: "slow-builder/custom-db-engine",
    owner: "slow-builder",
    name: "custom-db-engine",
    description: "Educational LSM-tree storage engine in Zig with zero external dependencies",
    category: "Database Engines",
    created_dt: "2023-11-20",
    week_start: "2024-02-12",
    week_num: 1258,
    score: 0.320,
    stars_cum: 95,
    stars_w0: 8,
    stars_w1: 7,
    growth_ratio: 1.0,
    fork_star_ratio: 0.15,
    burstiness: 0.30,
    prs_opened_4w: 4,
    prs_merged_4w: 4,
    pushes_4w: 18,
    active_days_4w: 12,
    pagerank: 0.024,
    community_id: 5,
    community_name: "Edge & C/C++ AI Systems",
    community_momentum: 180,
    is_breakout: false,
    actual_stars_next_4w: 42,
    trajectory: [
      { week_start: "2024-01-15", week_offset: 0, weekly_stars: 7, cumulative_stars: 65, score: 0.28 },
      { week_start: "2024-01-22", week_offset: 1, weekly_stars: 8, cumulative_stars: 73, score: 0.29 },
      { week_start: "2024-01-29", week_offset: 2, weekly_stars: 7, cumulative_stars: 80, score: 0.30 },
      { week_start: "2024-02-05", week_offset: 3, weekly_stars: 7, cumulative_stars: 87, score: 0.31 },
      { week_start: "2024-02-12", week_offset: 4, weekly_stars: 8, cumulative_stars: 95, score: 0.320 }
    ],
    nearest_costars: [
      { repo_name: "ziglang/zig", shared_stargazers: 14, score: 0.85 }
    ]
  }
];

// Co-star Network Graph Nodes & Edges
export const GRAPH_NODES: GraphNode[] = [
  { id: "vllm", repo_name: "vllm-project/vllm", community_id: 1, community_name: "LLM Serving", pagerank: 0.088, score: 0.942, stars_cum: 184, is_breakout: true },
  { id: "ollama", repo_name: "ollama/ollama", community_id: 1, community_name: "LLM Serving", pagerank: 0.094, score: 0.964, stars_cum: 92, is_breakout: true },
  { id: "llamacpp", repo_name: "ggerganov/llama.cpp", community_id: 1, community_name: "LLM Serving", pagerank: 0.125, score: 0.960, stars_cum: 1240, is_breakout: true },
  { id: "whisper", repo_name: "ggerganov/whisper.cpp", community_id: 5, community_name: "Systems & Edge", pagerank: 0.081, score: 0.925, stars_cum: 110, is_breakout: true },
  { id: "litellm", repo_name: "BerriAI/litellm", community_id: 2, community_name: "Agents & Gateways", pagerank: 0.076, score: 0.892, stars_cum: 210, is_breakout: true },
  { id: "langfuse", repo_name: "langfuse/langfuse", community_id: 2, community_name: "Agents & Gateways", pagerank: 0.072, score: 0.885, stars_cum: 260, is_breakout: true },
  { id: "phidata", repo_name: "phidatahq/phidata", community_id: 2, community_name: "Agents & Gateways", pagerank: 0.058, score: 0.865, stars_cum: 170, is_breakout: true },
  { id: "fastembed", repo_name: "qdrant/fastembed", community_id: 3, community_name: "Vector & Search", pagerank: 0.065, score: 0.874, stars_cum: 145, is_breakout: true },
  { id: "qdrant", repo_name: "qdrant/qdrant", community_id: 3, community_name: "Vector & Search", pagerank: 0.082, score: 0.910, stars_cum: 1150, is_breakout: true },
  { id: "chroma", repo_name: "chroma-core/chroma", community_id: 3, community_name: "Vector & Search", pagerank: 0.089, score: 0.890, stars_cum: 980, is_breakout: true },
  { id: "uv", repo_name: "astral-sh/uv", community_id: 5, community_name: "Systems & Edge", pagerank: 0.112, score: 0.982, stars_cum: 290, is_breakout: true },
  { id: "ruff", repo_name: "astral-sh/ruff", community_id: 5, community_name: "Systems & Edge", pagerank: 0.104, score: 0.980, stars_cum: 1420, is_breakout: true },
  { id: "customdb", repo_name: "slow-builder/custom-db-engine", community_id: 5, community_name: "Systems & Edge", pagerank: 0.024, score: 0.320, stars_cum: 95, is_breakout: false },
  { id: "botairdrop", repo_name: "bot-promoter/airdrop-claim-tool", community_id: 0, community_name: "Isolated", pagerank: 0.005, score: 0.142, stars_cum: 240, is_breakout: false }
];

export const GRAPH_EDGES: GraphEdge[] = [
  { source: "vllm", target: "ollama", weight: 31 },
  { source: "vllm", target: "llamacpp", weight: 38 },
  { source: "ollama", target: "llamacpp", weight: 44 },
  { source: "whisper", target: "llamacpp", weight: 47 },
  { source: "litellm", target: "vllm", weight: 26 },
  { source: "litellm", target: "ollama", weight: 29 },
  { source: "litellm", target: "langfuse", weight: 31 },
  { source: "phidata", target: "litellm", weight: 24 },
  { source: "phidata", target: "langfuse", weight: 19 },
  { source: "fastembed", target: "qdrant", weight: 36 },
  { source: "fastembed", target: "chroma", weight: 24 },
  { source: "qdrant", target: "chroma", weight: 33 },
  { source: "uv", target: "ruff", weight: 64 },
  { source: "uv", target: "llamacpp", weight: 18 },
  { source: "whisper", target: "uv", weight: 12 },
  { source: "customdb", target: "llamacpp", weight: 4 }
];

export interface EngineeredFeature {
  id: string;
  name: string;
  category: 'Velocity & Acceleration' | 'Developer Utility' | 'Activity & Maintenance' | 'GraphFrames Ecosystem';
  formula: string;
  sparkImplementation: string;
  description: string;
  importanceWeight: number;
  signalType: 'Positive Driver' | 'Organic Quality Filter' | 'Bot/Hype Penalizer' | 'Structural Multiplier';
}

export interface DatasetLedgerRow {
  stage: string;
  per1000Raw: number;
  ofPreviousPct: number;
  sharePct: number;
  description: string;
}

export const DATASET_LEDGER: DatasetLedgerRow[] = [
  {
    stage: "Raw Ingest Stream (2,184 hourly files)",
    per1000Raw: 1000.0,
    ofPreviousPct: 100.0,
    sharePct: 100.0,
    description: "1.48B raw JSON events from GitHub Archive Q1 timeline (1.84 TB uncompressed)"
  },
  {
    stage: "Bronze Events (Parquet Schema Enforced)",
    per1000Raw: 263.51,
    ofPreviousPct: 26.35,
    sharePct: 26.35,
    description: "390.0M events filtered to 6 core developer action types (Watch, Fork, Create, PR, Issue, Push)"
  },
  {
    stage: "Silver Events (Bot Pruned & Stargazer Deduplicated)",
    per1000Raw: 231.08,
    ofPreviousPct: 87.69,
    sharePct: 23.11,
    description: "342.0M validated human events; bot automation removed, initial star per user/repo enforced"
  },
  {
    stage: "Gold Layer: Repo-Day Aggregates",
    per1000Raw: 5.69,
    ofPreviousPct: 2.46,
    sharePct: 0.57,
    description: "8.42M daily aggregate rows; pruned one-off abandoned repos (<20 lifetime stars)"
  },
  {
    stage: "Gold Layer: Repo-Week Sparse Windows",
    per1000Raw: 0.865,
    ofPreviousPct: 15.20,
    sharePct: 0.0865,
    description: "1.28M sparse weekly windows; computed 4-week lookbacks without Cartesian zero-filling"
  },
  {
    stage: "Candidate Window Screening (20–300 stars, age <= 26w)",
    per1000Raw: 0.100,
    ofPreviousPct: 11.56,
    sharePct: 0.0100,
    description: "148,000 early-stage candidate snapshots eligible for breakout scoring"
  },
  {
    stage: "Ground Truth Verified Breakouts (gained >= 500 stars in 4w)",
    per1000Raw: 0.00086,
    ofPreviousPct: 0.86,
    sharePct: 0.000086,
    description: "1,280 true breakout repositories (0.86% natural base rate across the GitHub ecosystem)"
  }
];

export const ENGINEERED_FEATURES: EngineeredFeature[] = [
  {
    id: "F01",
    name: "Snapshot Star Velocity (w0)",
    category: "Velocity & Acceleration",
    formula: "stars_w0 = count(WatchEvent) in snapshot week",
    sparkImplementation: "sum('daily_stars').over(Window.partitionBy('repo_id').rangeBetween(-6, 0))",
    description: "Number of unique developer stars acquired in the 7 days leading up to the observation point.",
    importanceWeight: 0.24,
    signalType: "Positive Driver"
  },
  {
    id: "F02",
    name: "Week-Over-Week Growth Ratio",
    category: "Velocity & Acceleration",
    formula: "growth_ratio = stars_w0 / (stars_w1 + 1)",
    sparkImplementation: "col('stars_w0') / (lag('stars_w0', 1).over(w_time) + 1)",
    description: "Relative star acceleration compared to the preceding week; flags rapid inflection curves.",
    importanceWeight: 0.19,
    signalType: "Positive Driver"
  },
  {
    id: "F03",
    name: "Fork-to-Star Conversion Ratio",
    category: "Developer Utility",
    formula: "fork_star_ratio = forks_4w / (stars_4w + 1)",
    sparkImplementation: "sum('daily_forks').over(w_28d) / (sum('daily_stars').over(w_28d) + 1)",
    description: "Forks reflect real code exploration and execution, penalizing cosmetic social bookmarking.",
    importanceWeight: 0.15,
    signalType: "Organic Quality Filter"
  },
  {
    id: "F04",
    name: "Burstiness / Organic Dispersion Index",
    category: "Velocity & Acceleration",
    formula: "burstiness = max_day_stars / (stars_w0 + 1)",
    sparkImplementation: "max('daily_stars').over(w_7d) / (col('stars_w0') + 1)",
    description: "Distinguishes sustained organic adoption (<0.35) from artificial bot campaigns or 1-day HackerNews spikes (>0.85).",
    importanceWeight: 0.12,
    signalType: "Bot/Hype Penalizer"
  },
  {
    id: "F05",
    name: "GraphFrames PageRank Centrality",
    category: "GraphFrames Ecosystem",
    formula: "PageRank(G_costar, resetProb=0.15, maxIter=10)",
    sparkImplementation: "GraphFrame(v, e).pageRank(resetProbability=0.15, maxIter=10)",
    description: "Measures structural authority in the co-stargazer ecosystem; stars from prolific engineers carry higher eigenvector weight.",
    importanceWeight: 0.11,
    signalType: "Structural Multiplier"
  },
  {
    id: "F06",
    name: "Co-Star Community Momentum",
    category: "GraphFrames Ecosystem",
    formula: "sum(stars_4w of top 5 bipartite neighbor repos)",
    sparkImplementation: "edges.join(repo_growth, 'target').groupBy('src').agg(sum('neighbour_growth'))",
    description: "Measures whether the repository belongs to an expanding technological cluster (e.g., local LLMs, CUDA kernels).",
    importanceWeight: 0.08,
    signalType: "Structural Multiplier"
  },
  {
    id: "F07",
    name: "Pull Requests Merged (4-Week)",
    category: "Activity & Maintenance",
    formula: "count(PullRequestEvent where action='closed' and merged=true)",
    sparkImplementation: "sum('prs_merged_daily').over(Window.partitionBy('repo_id').rowsBetween(-27, 0))",
    description: "Active development throughput and responsive maintainer review bandwidth.",
    importanceWeight: 0.07,
    signalType: "Organic Quality Filter"
  },
  {
    id: "F08",
    name: "Active Contributor Days (4-Week)",
    category: "Activity & Maintenance",
    formula: "count(distinct event_dates with PushEvent or PREvent)",
    sparkImplementation: "countDistinct(when(col('is_active_day'), col('dt'))).over(w_28d)",
    description: "Continuity of software development; filters out dormant forks that saw sudden random traffic.",
    importanceWeight: 0.05,
    signalType: "Organic Quality Filter"
  },
  {
    id: "F09",
    name: "Push Commit Volume (4-Week)",
    category: "Activity & Maintenance",
    formula: "sum(distinct commit_count) in 28-day window",
    sparkImplementation: "sum('daily_pushes').over(w_28d)",
    description: "Raw volume of git commits pushed to the default branch.",
    importanceWeight: 0.04,
    signalType: "Organic Quality Filter"
  },
  {
    id: "F10",
    name: "Cumulative Baseline Stars",
    category: "Velocity & Acceleration",
    formula: "stars_cum = lifetime stars at snapshot date",
    sparkImplementation: "sum('daily_stars').over(Window.partitionBy('repo_id').rowsBetween(Window.unboundedPreceding, 0))",
    description: "Current repository star size (clamped to 20-300 candidate window).",
    importanceWeight: 0.04,
    signalType: "Positive Driver"
  },
  {
    id: "F11",
    name: "Lag-2 Week Stars (w1)",
    category: "Velocity & Acceleration",
    formula: "stars_w1 = count(WatchEvent) in [t-14, t-7]",
    sparkImplementation: "lag('stars_w0', 1).over(Window.partitionBy('repo_id').orderBy('week_num'))",
    description: "Velocity trajectory from two weeks prior to establish multi-step trend smoothness.",
    importanceWeight: 0.03,
    signalType: "Positive Driver"
  },
  {
    id: "F12",
    name: "Author Diversity Ratio",
    category: "Developer Utility",
    formula: "distinct_committers / total_commits_4w",
    sparkImplementation: "approx_count_distinct('actor_login').over(w_28d) / (col('pushes_4w') + 1)",
    description: "Distinguishes community-driven open source projects from single-author prototypes.",
    importanceWeight: 0.03,
    signalType: "Organic Quality Filter"
  },
  {
    id: "F13",
    name: "Issue Closure Velocity",
    category: "Activity & Maintenance",
    formula: "issues_closed_4w / (issues_opened_4w + 1)",
    sparkImplementation: "sum('issues_closed').over(w_28d) / (sum('issues_opened').over(w_28d) + 1)",
    description: "Efficiency at triaging bug reports and community feedback.",
    importanceWeight: 0.02,
    signalType: "Organic Quality Filter"
  },
  {
    id: "F14",
    name: "Repository Age (Weeks)",
    category: "Developer Utility",
    formula: "age_weeks = (snapshot_dt - created_dt) / 7",
    sparkImplementation: "datediff(col('snapshot_dt'), col('created_dt')) / 7.0",
    description: "Newer repositories with identical velocity exhibit exponentially higher probability of breakout.",
    importanceWeight: 0.02,
    signalType: "Positive Driver"
  },
  {
    id: "F15",
    name: "Label Propagation Community ID",
    category: "GraphFrames Ecosystem",
    formula: "GraphFrames LPA(maxIter=5)",
    sparkImplementation: "GraphFrame(v, e).labelPropagation(maxIter=5)",
    description: "Discrete developer subculture clustering (e.g. LLM Serving, Agent Frameworks, Vector DBs).",
    importanceWeight: 0.02,
    signalType: "Structural Multiplier"
  },
  {
    id: "F16",
    name: "Co-Star Degree Centrality",
    category: "GraphFrames Ecosystem",
    formula: "degree = count(edges where shared_stargazers >= 3)",
    sparkImplementation: "GraphFrame(v, e).degrees",
    description: "Number of high-affinity adjacent repositories sharing multiple cross-stargazers.",
    importanceWeight: 0.02,
    signalType: "Structural Multiplier"
  }
];

