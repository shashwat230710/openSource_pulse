# Makefile for Open-Source Pulse
# Reproducible big data pipeline and analytics dashboard

SHELL := /bin/bash
PYTHON := python3
SPARK_SUBMIT := spark-submit
TIER ?= T0

# Default Spark Submit Options (Local 16GB Config from Section 7)
SPARK_OPTS := --master "local[8]" \
	--driver-memory 12g \
	--conf spark.sql.session.timeZone=UTC \
	--conf spark.sql.shuffle.partitions=200 \
	--conf spark.sql.adaptive.enabled=true \
	--conf spark.sql.adaptive.coalescePartitions.enabled=true \
	--conf spark.sql.adaptive.skewJoin.enabled=true \
	--conf spark.sql.autoBroadcastJoinThreshold=64m \
	--conf spark.sql.parquet.compression.codec=zstd \
	--conf spark.sql.sources.partitionOverwriteMode=dynamic

.PHONY: all help download ingest silver gold graph features train score serve test benchmark clean

help:
	@echo "Open-Source Pulse Pipeline Commands:"
	@echo "  make download    - Generate URLs and download GH Archive hourly files"
	@echo "  make ingest      - Phase 2: Ingest raw JSON.gz to Bronze Parquet"
	@echo "  make silver      - Phase 3: Bot-filtering, star deduplication, compaction"
	@echo "  make gold        - Phase 4: Aggregate to repo-day and repo-week"
	@echo "  make graph       - Phase 7: Co-star GraphFrames analytics (PageRank & communities)"
	@echo "  make features    - Phase 5 & 6: Feature engineering, labeling, time splits with embargo"
	@echo "  make train       - Phase 8: Model training (Baselines B0/B1, M1, M2 GBT, M3 Graph)"
	@echo "  make score       - Phase 10: Materialize weekly scores for serving"
	@echo "  make serve       - Run FastAPI DuckDB serving layer"
	@echo "  make test        - Run leakage and schema unit tests"
	@echo "  make benchmark   - Execute benchmark suite E1 to E9"
	@echo "  make run-full    - End-to-end pipeline execution"

download:
	@mkdir -p data/raw
	@echo "Generating GH Archive URLs for Tier $(TIER)..."
	./scripts/make_urls.sh 2024-01-01 2024-01-07 > data/raw/urls.txt
	@echo "Download with aria2c or curl: aria2c -i data/raw/urls.txt -d data/raw -j 8 -c"

ingest:
	@mkdir -p data/bronze/events
	$(SPARK_SUBMIT) $(SPARK_OPTS) jobs/01_ingest.py "data/raw/*.json.gz" data/bronze/events

silver:
	@mkdir -p data/silver/events data/silver/stars_deduped
	$(SPARK_SUBMIT) $(SPARK_OPTS) jobs/02_silver.py data/bronze/events data/silver/events data/silver/stars_deduped

gold:
	@mkdir -p data/gold/repo_day data/gold/repo_week
	$(SPARK_SUBMIT) $(SPARK_OPTS) jobs/03_gold.py data/silver/events data/silver/stars_deduped data/gold/repo_day data/gold/repo_week

graph:
	@mkdir -p data/gold/graph
	$(SPARK_SUBMIT) $(SPARK_OPTS) jobs/04_graph.py data/silver/stars_deduped data/gold/repo_week data/gold/graph

features:
	@mkdir -p data/gold/features data/gold/splits
	$(SPARK_SUBMIT) $(SPARK_OPTS) jobs/05_features_labels.py data/gold/repo_week data/gold/features data/gold/splits

train:
	@mkdir -p benchmarks
	$(SPARK_SUBMIT) $(SPARK_OPTS) jobs/06_train_eval.py data/gold/splits data/gold/graph benchmarks

score:
	@mkdir -p data/serving/scores
	$(SPARK_SUBMIT) $(SPARK_OPTS) jobs/07_score.py data/gold/features data/serving/scores

serve:
	uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

test:
	$(PYTHON) tests/test_leakage.py
	$(PYTHON) tests/test_schema.py

benchmark:
	$(PYTHON) benchmarks/run_experiments.py

run-full: test ingest silver gold graph features train score
	@echo "End-to-end Open-Source Pulse pipeline complete!"

clean:
	rm -rf data/tmp data/bronze data/silver data/gold data/serving/scores
