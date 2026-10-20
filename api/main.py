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
    """
    Returns top predicted breakout repositories for a given snapshot week.
    Matches the exact specification from Section 6 Phase 10 of the implementation blueprint.
    """
    try:
        if week:
            query = f"""
            SELECT repo_name, score, stars_cum, stars_w0, growth_ratio, fork_star_ratio
            FROM read_parquet('{SCORES_PARQUET_PATH}')
            WHERE week_start = CAST(? AS DATE)
            ORDER BY score DESC
            LIMIT ?
            """
            df = con.execute(query, [week, k]).fetchdf()
        else:
            query = f"""
            SELECT repo_name, score, stars_cum, stars_w0, growth_ratio, fork_star_ratio
            FROM read_parquet('{SCORES_PARQUET_PATH}')
            WHERE week_start = (SELECT MAX(week_start) FROM read_parquet('{SCORES_PARQUET_PATH}'))
            ORDER BY score DESC
            LIMIT ?
            """
            df = con.execute(query, [k]).fetchdf()
        return df.to_dict(orient="records")
    except Exception as e:
        # Fallback response if parquet directory is being generated
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/repo/{owner}/{name}")
def get_repo_trajectory(owner: str, name: str):
    """
    Retrieves full historical weekly trajectory, stars, and model score progression for a repository.
    """
    repo_name = f"{owner}/{name}"
    try:
        query = f"""
        SELECT week_start, stars_w0 AS stars, stars_cum, score
        FROM read_parquet('{SCORES_PARQUET_PATH}')
        WHERE repo_name = ?
        ORDER BY week_start ASC
        """
        df = con.execute(query, [repo_name]).fetchdf()
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Repository {repo_name} not found in candidate pool.")
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
