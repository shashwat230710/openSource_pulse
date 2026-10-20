#!/usr/bin/env python3
"""
Phase 3: Clean to Silver
Cleans Bronze data by dropping un-attributable records, filtering bot activity,
and deduplicating stars (first star per user per repo). Compats data into monthly partitions.
"""

import sys
import os
from pyspark.sql import SparkSession, functions as F

BOT_REGEX = r"(\[bot\]$|-bot$|^dependabot|^renovate|^github-actions)"

def main(in_bronze, out_silver, out_stars):
    spark = (SparkSession.builder
             .appName("pulse-02-silver")
             .config("spark.sql.session.timeZone", "UTC")
             .config("spark.sql.parquet.compression.codec", "zstd")
             .getOrCreate())

    print(f"Reading bronze events from: {in_bronze}")
    ev = spark.read.parquet(in_bronze)

    # 1. Integrity filter: drop records without valid repo or actor IDs
    # 2. Bot filter: drop automated activity that inflates counts
    cleaned = (ev
               .where(F.col("repo_id").isNotNull() & F.col("actor_id").isNotNull())
               .where(~F.col("actor_login").rlike(BOT_REGEX)))

    # 3. Star deduplication: keep ONLY the first star per (repo_id, actor_id)
    # This ensures un-star/re-star attacks and campaigns don't inflate labels
    stars_raw = cleaned.where(F.col("type") == "WatchEvent")
    stars_deduped = (stars_raw
                     .groupBy("repo_id", "actor_id")
                     .agg(F.min("ts").alias("ts"))
                     .withColumn("dt", F.to_date("ts")))

    # 4. Compaction & Monthly Partitioning
    cleaned_with_month = cleaned.withColumn("month", F.date_format("ts", "yyyy-MM"))
    
    os.makedirs(out_silver, exist_ok=True)
    (cleaned_with_month
     .sortWithinPartitions("repo_id")
     .write.mode("overwrite")
     .partitionBy("month")
     .option("compression", "zstd")
     .parquet(out_silver))

    os.makedirs(out_stars, exist_ok=True)
    (stars_deduped
     .write.mode("overwrite")
     .option("compression", "zstd")
     .parquet(out_stars))

    print(f"Silver cleaning completed -> {out_silver} and {out_stars}")
    spark.stop()

if __name__ == "__main__":
    bronze = sys.argv[1] if len(sys.argv) > 1 else "data/bronze/events"
    silver = sys.argv[2] if len(sys.argv) > 2 else "data/silver/events"
    stars = sys.argv[3] if len(sys.argv) > 3 else "data/silver/stars_deduped"
    main(bronze, silver, stars)
