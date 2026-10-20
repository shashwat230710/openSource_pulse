#!/usr/bin/env python3
"""
Phase 4: Aggregate to Gold (repo-day and repo-week)
The primary efficiency breakthrough of Open-Source Pulse:
Collapses billions of fine-grained events into compact repo-day aggregates,
prunes the long tail (repos with < 20 lifetime stars), broadcasts the keep list,
and rolls up into sparse repo-week rows with a numeric week index.
"""

import sys
import os
from pyspark.sql import SparkSession, functions as F

def main(in_silver, in_stars, out_repo_day, out_repo_week):
    spark = (SparkSession.builder
             .appName("pulse-03-gold")
             .config("spark.sql.session.timeZone", "UTC")
             .config("spark.sql.parquet.compression.codec", "zstd")
             .config("spark.sql.autoBroadcastJoinThreshold", "67108864")  # 64MB broadcast
             .getOrCreate())

    print("Loading silver cleaned events and deduped stars...")
    ev = spark.read.parquet(in_silver)
    stars = spark.read.parquet(in_stars)

    # 1. Lifetime stars per repo -> Keep list of repositories that can ever be candidates
    star_tot = stars.groupBy("repo_id").agg(F.count("*").alias("n"))
    keep = F.broadcast(star_tot.where("n >= 20").select("repo_id"))
    print("Identified candidate repositories meeting minimum 20-star criteria.")

    # 2. Candidate repos created inside the data window (guarantees exact cumulative history)
    created = (ev.where((F.col("type") == "CreateEvent") & (F.col("ref_type") == "repository"))
               .groupBy("repo_id")
               .agg(
                   F.min("dt").alias("created_dt"),
                   F.max("repo_name").alias("repo_name")
               ))

    # 3. Repo-day aggregation
    star_day = (stars.join(keep, "repo_id")
                .groupBy("repo_id", "dt")
                .agg(F.count("*").alias("stars")))

    act_day = (ev.join(keep, "repo_id").where(F.col("type") != "WatchEvent")
               .groupBy("repo_id", "dt")
               .agg(
                   F.sum((F.col("type") == "ForkEvent").cast("int")).alias("forks"),
                   F.sum(((F.col("type") == "PullRequestEvent") & (F.col("action") == "opened")).cast("int")).alias("prs_opened"),
                   F.sum(((F.col("type") == "PullRequestEvent") & F.col("pr_merged")).cast("int")).alias("prs_merged"),
                   F.sum((F.col("type") == "IssuesEvent").cast("int")).alias("issues"),
                   F.sum((F.col("type") == "PushEvent").cast("int")).alias("pushes"),
                   F.approx_count_distinct("actor_id").alias("actors")
               ))

    repo_day = (star_day.join(act_day, ["repo_id", "dt"], "full_outer")
                .fillna(0)
                .join(created, "repo_id"))

    os.makedirs(out_repo_day, exist_ok=True)
    repo_day.write.mode("overwrite").parquet(out_repo_day)
    print(f"Repo-day table materialized -> {out_repo_day}")

    # 4. Repo-week aggregation with numeric week index (Mondays starting 2000-01-03)
    # Using numeric index allows sparse rangeBetween windows without filling empty calendar weeks!
    repo_week = (repo_day
                 .withColumn("week_start", F.to_date(F.date_trunc("week", "dt")))
                 .withColumn("week_num", (F.datediff("week_start", F.lit("2000-01-03")) / 7).cast("long"))
                 .groupBy("repo_id", "repo_name", "created_dt", "week_num", "week_start")
                 .agg(
                     F.sum("stars").alias("stars"),
                     F.sum("forks").alias("forks"),
                     F.sum("prs_opened").alias("prs_opened"),
                     F.sum("prs_merged").alias("prs_merged"),
                     F.sum("issues").alias("issues"),
                     F.sum("pushes").alias("pushes"),
                     F.max("stars").alias("max_day_stars"),
                     F.countDistinct("dt").alias("active_days")
                 ))

    os.makedirs(out_repo_week, exist_ok=True)
    repo_week.write.mode("overwrite").parquet(out_repo_week)
    print(f"Repo-week table materialized -> {out_repo_week}")

    spark.stop()

if __name__ == "__main__":
    silver_path = sys.argv[1] if len(sys.argv) > 1 else "data/silver/events"
    stars_path = sys.argv[2] if len(sys.argv) > 2 else "data/silver/stars_deduped"
    repo_day_path = sys.argv[3] if len(sys.argv) > 3 else "data/gold/repo_day"
    repo_week_path = sys.argv[4] if len(sys.argv) > 4 else "data/gold/repo_week"
    main(silver_path, stars_path, repo_day_path, repo_week_path)
