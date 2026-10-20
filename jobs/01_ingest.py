#!/usr/bin/env python3
"""
Phase 2: Ingest to Bronze
Reads hourly GH Archive JSON files with an explicit partial schema.
Skips full schema inference, filters to relevant event types upfront,
and writes daily partitioned Parquet files compressed with zstd.
"""

import sys
import os
KEEP = [
    "WatchEvent",
    "ForkEvent",
    "CreateEvent",
    "PullRequestEvent",
    "IssuesEvent",
    "PushEvent"
]

try:
    from pyspark.sql import SparkSession, functions as F, types as T
    HAS_PYSPARK = True
except ImportError:
    SparkSession, F, T = None, None, None
    HAS_PYSPARK = False

if T is not None:
    SCHEMA = T.StructType([
        T.StructField("id", T.StringType()),
        T.StructField("type", T.StringType()),
        T.StructField("created_at", T.StringType()),
        T.StructField("actor", T.StructType([
            T.StructField("id", T.LongType()),
            T.StructField("login", T.StringType())
        ])),
        T.StructField("repo", T.StructType([
            T.StructField("id", T.LongType()),
            T.StructField("name", T.StringType())
        ])),
        T.StructField("org", T.StructType([
            T.StructField("id", T.LongType())
        ])),
        T.StructField("payload", T.StructType([
            T.StructField("action", T.StringType()),
            T.StructField("ref_type", T.StringType()),
            T.StructField("size", T.LongType()),
            T.StructField("pull_request", T.StructType([
                T.StructField("merged", T.BooleanType())
            ]))
        ])),
    ])
else:
    SCHEMA = None

def main(glob_in, out_dir):
    spark = (SparkSession.builder
             .appName("pulse-01-ingest")
             .config("spark.sql.session.timeZone", "UTC")
             .config("spark.sql.parquet.compression.codec", "zstd")
             .config("spark.sql.sources.partitionOverwriteMode", "dynamic")
             .getOrCreate())

    print(f"Reading raw archives from: {glob_in}")
    # Explicit schema prevents full inference pass across billions of nested JSON payloads
    raw = spark.read.schema(SCHEMA).json(glob_in)

    # Filter event types immediately before any projection or shuffle
    ev = (raw.where(F.col("type").isin(KEEP))
          .select(
              "id",
              "type",
              F.to_timestamp("created_at").alias("ts"),
              F.col("repo.id").alias("repo_id"),
              F.col("repo.name").alias("repo_name"),
              F.col("actor.id").alias("actor_id"),
              F.col("actor.login").alias("actor_login"),
              F.col("org.id").alias("org_id"),
              F.col("payload.action").alias("action"),
              F.col("payload.ref_type").alias("ref_type"),
              F.col("payload.size").alias("push_size"),
              F.col("payload.pull_request.merged").alias("pr_merged")
          )
          .withColumn("dt", F.to_date("ts")))

    # Idempotent write partitioned by date
    os.makedirs(out_dir, exist_ok=True)
    (ev.write.mode("overwrite")
     .partitionBy("dt")
     .option("compression", "zstd")
     .parquet(out_dir))

    print(f"Bronze ingestion complete -> {out_dir}")
    spark.stop()

if __name__ == "__main__":
    in_path = sys.argv[1] if len(sys.argv) > 1 else "data/raw/*.json.gz"
    out_path = sys.argv[2] if len(sys.argv) > 2 else "data/bronze/events"
    main(in_path, out_path)
