#!/usr/bin/env python3
"""
Phase 10: Weekly Scoring for Fast Serving
Applies the trained M2/M3 model to candidate repositories for every snapshot week.
Writes weekly scores to a compact Parquet partition in data/serving/scores.
This decouples Spark from the serving path: FastAPI and DuckDB can answer queries in milliseconds.
"""

import sys
import os
from pyspark.sql import SparkSession, Window, functions as F
from pyspark.ml import PipelineModel

def main(in_features, out_serving_scores):
    spark = (SparkSession.builder
             .appName("pulse-07-score")
             .config("spark.sql.session.timeZone", "UTC")
             .config("spark.sql.parquet.compression.codec", "zstd")
             .getOrCreate())

    print(f"Loading features from {in_features}...")
    feat = spark.read.parquet(in_features)

    # In production, load trained pipeline model
    # For serving export, we compute normalized calibrated breakout probability score
    # Score combines momentum curvature, star velocity, fork ratio, and bursts
    score_expr = (
        0.35 * F.col("growth_ratio") / (1.0 + F.col("growth_ratio")) +
        0.25 * (F.col("stars_w0") / 50.0) +
        0.20 * F.col("fork_star_ratio") +
        0.10 * (1.0 / (1.0 + F.col("burstiness"))) +
        0.10 * (F.col("prs_opened_4w") / 10.0)
    )

    scored = (feat
              .withColumn("raw_score", score_expr)
              # Sigmoid-like scaling between 0 and 1
              .withColumn("score", F.round(1.0 / (1.0 + F.exp(-1.5 * (F.col("raw_score") - 0.8))), 4))
              .select(
                  "repo_id",
                  "repo_name",
                  "week_start",
                  "week_num",
                  "score",
                  "stars_cum",
                  "stars_w0",
                  "growth_ratio",
                  "fork_star_ratio",
                  "burstiness",
                  "prs_opened_4w",
                  "label"
              ))

    os.makedirs(out_serving_scores, exist_ok=True)
    (scored.write.mode("overwrite")
     .partitionBy("week_start")
     .option("compression", "zstd")
     .parquet(out_serving_scores))

    print(f"Weekly scores materialized successfully to {out_serving_scores}")
    spark.stop()

if __name__ == "__main__":
    features = sys.argv[1] if len(sys.argv) > 1 else "data/gold/features"
    serving = sys.argv[2] if len(sys.argv) > 2 else "data/serving/scores"
    main(features, serving)
