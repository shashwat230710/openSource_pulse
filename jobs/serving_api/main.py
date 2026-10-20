#!/usr/bin/env python3
"""
Phase 10: Serving API with FastAPI and DuckDB
Serves precomputed weekly scores and repo drill-down metrics in milliseconds.
Reads directly from Parquet files using DuckDB's vectorized query engine.
Spark is intentionally offline during serving!
"""

import os
from typing import List, Optional
import duckdb
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Open-Source Pulse API",
    description="Millisecond serving API for GitHub repository breakout predictions powered by DuckDB & Parquet",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to in-process DuckDB engine
con = duckdb.connect(database=":memory:", read_only=False)

SCORES_PARQUET_PATH = os.environ.get("SCORES_PATH", "data/serving/scores/*.parquet")

class TopCandidate(BaseModel):
    repo_name: str
    score: float
    stars_cum: int
    stars_w0: int
    growth_ratio: float
    fork_star_ratio: Optional[float] = 0.0

class RepoWeeklyPoint(BaseModel):
    week_start: str
    stars: int
    stars_cum: int
    score: float

@app.get("/")
def health_check():
    return {
        "status": "online",
        "system": "Open-Source Pulse Serving API",
        "backend": "DuckDB vectorized Parquet engine"
    }

@app.get("/top")
def get_top_breakouts(
    week: Optional[str] = Query(None, description="Snapshot week (YYYY-MM-DD)"),
    k: int = Query(50, description="Top-K candidates to return")
):
    try:
        query = f"""
            SELECT repo_name, score, stars_cum, stars_w0, growth_ratio, fork_star_ratio
            FROM read_parquet('{SCORES_PARQUET_PATH}')
            WHERE 1=1
        """
        if week:
            query += f" AND week_start = '{week}'"
        query += f" ORDER BY score DESC LIMIT {k}"
        results = con.execute(query).fetchall()
        return [
            {
                "repo_name": r[0],
                "score": round(r[1], 4),
                "stars_cum": r[2],
                "stars_w0": r[3],
                "growth_ratio": round(r[4], 2),
                "fork_star_ratio": round(r[5], 3)
            }
            for r in results
        ]
    except Exception as e:
        return {"error": str(e), "message": "Parquet data not generated yet. Run pipeline first."}
