#!/usr/bin/env python3
"""
Phase 5 & 6: Feature Engineering, Labels, and Time-Based Splits with Embargo Gap
Generates momentum, adoption, collaboration, and burstiness features strictly using
past information up to the snapshot week.
Defines the future target label (>= 500 stars in next 4 weeks) and splits by time
with an embargo gap equal to H (4 weeks) to completely prevent future label leakage.
"""

import sys
import os
from pyspark.sql import SparkSession, Window, functions as F

def rs(col_name, lo, hi, window_spec):
    """Sum over a range of week offsets; null -> 0"""
    return F.coalesce(F.sum(col_name).over(window_spec.rangeBetween(lo, hi)), F.lit(0))

def main(in_gold_week, out_features, out_splits_dir):
    spark = (SparkSession.builder
             .appName("pulse-05-features-labels")
             .config("spark.sql.session.timeZone", "UTC")
             .config("spark.sql.parquet.compression.codec", "zstd")
             .getOrCreate())

    print(f"Loading repo-week data from: {in_gold_week}")
    repo_week = spark.read.parquet(in_gold_week)

    # Window partitioned by repo_id and ordered by numeric week_num
    w = Window.partitionBy("repo_id").orderBy("week_num")

    # Feature Engineering (Past only)
    feat = (repo_week
            .withColumn("stars_cum", rs("stars", Window.unboundedPreceding, 0, w))
            .withColumn("stars_w0", F.col("stars"))
            .withColumn("stars_w1", rs("stars", -1, -1, w))
            .withColumn("stars_w2", rs("stars", -2, -2, w))
            .withColumn("stars_w3", rs("stars", -3, -3, w))
            .withColumn("stars_4w", rs("stars", -3, 0, w))
            .withColumn("forks_4w", rs("forks", -3, 0, w))
            .withColumn("prs_opened_4w", rs("prs_opened", -3, 0, w))
            .withColumn("prs_merged_4w", rs("prs_merged", -3, 0, w))
            .withColumn("issues_4w", rs("issues", -3, 0, w))
            .withColumn("pushes_4w", rs("pushes", -3, 0, w))
            .withColumn("age_weeks", F.datediff("week_start", "created_dt") / 7.0)
            .withColumn("growth_ratio", F.col("stars_w0") / (F.col("stars_w1") + 1.0))
            .withColumn("fork_star_ratio", F.col("forks_4w") / (F.col("stars_4w") + 1.0))
            .withColumn("burstiness", F.col("max_day_stars") / (F.col("stars_w0") + 1.0)))

    # Phase 6: Labels and Candidate Pool Filtering
    H = 4  # Forecast horizon: 4 weeks ahead (~30 days)
    last_week_row = feat.agg(F.max("week_num")).first()
    last_week = last_week_row[0] if last_week_row and last_week_row[0] is not None else 0

    # Label calculation: stars in weeks [snapshot + 1, snapshot + H]
    # CRITICAL: stars_next is strictly used for the label and is NEVER included in features!
    labeled_data = (feat
                    .withColumn("stars_next", rs("stars", 1, H, w))
                    # Candidate pool: repos created inside window, with 20 to 300 cumulative stars, age <= 26 weeks
                    .where((F.col("stars_cum").between(20, 300)) & (F.col("age_weeks") <= 26))
                    # Drop recent weeks that do not have a complete H-week observation horizon
                    .where(F.col("week_num") <= last_week - H)
                    # Binary classification label: 1 if repo gains >= 500 stars in the next 4 weeks
                    .withColumn("label", (F.col("stars_next") >= 500).cast("int")))

    os.makedirs(out_features, exist_ok=True)
    labeled_data.write.mode("overwrite").parquet(out_features)
    print(f"Features and labels table written -> {out_features}")

    # Determine timeline cuts for train, validation, and test splits
    min_week = labeled_data.agg(F.min("week_num")).first()[0] or 0
    max_eval_week = last_week - H
    total_weeks = max(1, max_eval_week - min_week)

    t1 = min_week + int(total_weeks * 0.5)
    t2 = t1 + int(total_weeks * 0.25)

    print(f"Timeline splits: min_week={min_week}, t1={t1}, t2={t2}, max_eval_week={max_eval_week}, embargo_gap={H}")

    # Strict time split with embargo gap equal to forecast horizon H
    train_df = labeled_data.where(F.col("week_num") <= t1)
    val_df = labeled_data.where((F.col("week_num") > t1 + H) & (F.col("week_num") <= t2))
    test_df = labeled_data.where(F.col("week_num") > t2 + H)

    os.makedirs(out_splits_dir, exist_ok=True)
    train_df.write.mode("overwrite").parquet(f"{out_splits_dir}/train")
    val_df.write.mode("overwrite").parquet(f"{out_splits_dir}/val")
    test_df.write.mode("overwrite").parquet(f"{out_splits_dir}/test")

    print(f"Splits generated: train={train_df.count()}, val={val_df.count()}, test={test_df.count()}")
    spark.stop()

if __name__ == "__main__":
    in_gold = sys.argv[1] if len(sys.argv) > 1 else "data/gold/repo_week"
    out_feat = sys.argv[2] if len(sys.argv) > 2 else "data/gold/features"
    out_splits = sys.argv[3] if len(sys.argv) > 3 else "data/gold/splits"
    main(in_gold, out_feat, out_splits)
