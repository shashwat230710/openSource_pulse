export interface ManifestData {
  run_id: string;
  generated_at: string;
  git_commit: string;
  spark_version: string;
  cores: number;
  driver_memory: string;
  tier: string;
  date_range: string;
  hours_ingested: number;
  raw_events: number;
  raw_size_gb: number;
  parquet_size_gb?: number;
  compression_ratio?: number;
  bot_share_pct?: number;
  base_rate_breakout_pct?: number;
}

export interface FunnelStageData {
  stage: string;
  rows: number;
  size_mb: number;
  runtime_s: number;
  grain: string;
  note: string;
}

export interface BenchmarkData {
  id: string;
  title: string;
  baseline_label: string;
  baseline_value: number;
  optimized_label: string;
  optimized_value: number;
  unit: string;
  note: string;
  evidence_path: string;
  speedup: string;
  scaling_series?: { x: number; y: number }[];
}

export interface ModelData {
  id: string;
  name: string;
  role: string;
  pr_auc: number;
  roc_auc: number;
  p_at_20: number;
  p_at_50: number;
  p_at_100: number;
  avg_lead_time_weeks: number;
  features: string[];
  importances: Record<string, number>;
}

export interface GraphNodeData {
  id: string;
  name: string;
  community: string;
  pagerank: number;
  stars_cum: number;
  x: number;
  y: number;
}

export interface GraphEdgeData {
  source: string;
  target: string;
  weight: number;
}

export interface GraphSampleData {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

export interface PredictionData {
  week_start: string;
  rank: number;
  repo_name: string;
  score: number;
  stars_cum: number;
  stars_w0: number;
  stars_next_4w: number;
  label: boolean;
}
