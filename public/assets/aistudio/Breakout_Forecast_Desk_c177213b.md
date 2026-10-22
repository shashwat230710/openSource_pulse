Open-Source Pulse · Bulletin

# Breakout Forecast Desk

**Sample data.** The repositories and numbers here are synthetic so the interface can be tried. Replace them with your pipeline’s JSON export (the DATA block in the script).

[Watchlist](#radar)[What-if forecaster](#whatif)[Verification](#verify)[Dataset ledger](#ledger)

## Watchlistsample

Candidate repositories (20–300 stars) ranked by their forecast chance of gaining 500 or more stars in the next four weeks. Open a repository for its growth curve and what drove the score.

Week Sort

| # | Repository | Stars | This week | Velocity | Fork/star | Breakout score | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- |

## What-if forecastersample model

Enter a repository’s signals and the model returns its breakout probability, compared with the base rate and a simple persistence rule.

## Verificationsample

Forecasts are checked against what happened. Precision at ten compares the model with a persistence rule (rank by week-over-week growth); the reliability chart shows whether the stated probabilities were honest.

| Ranking | Precision@10 | Lift |
| --- | --- | --- |

## Dataset ledgersample

How much of the raw event stream survives each stage, shown per 1,000 raw events so the ratios are easy to compare across runs.

| Stage | Per 1,000 raw | Of previous | Share |
| --- | --- | --- | --- |

Sample interface. Every figure on this page must come from run_manifest.json and the exported JSON files of an actual run.