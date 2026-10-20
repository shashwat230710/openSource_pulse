#!/usr/bin/env bash
# scripts/make_urls.sh
# Generates list of GH Archive hourly URLs between START and END dates (inclusive)
# Usage: ./scripts/make_urls.sh 2024-01-01 2024-01-07 > urls.txt

set -euo pipefail

if [ "$#" -lt 2 ]; then
    echo "Usage: $0 START_DATE END_DATE" >&2
    echo "Example: $0 2024-01-01 2024-01-07" >&2
    exit 1
fi

d="$1"
end_target="$2"

if date -v+1d >/dev/null 2>&1; then
    # BSD date (macOS)
    end=$(date -j -v+1d -f "%Y-%m-%d" "$end_target" "+%Y-%m-%d")
    next_day() { date -j -v+1d -f "%Y-%m-%d" "$1" "+%Y-%m-%d"; }
else
    # GNU date (Linux)
    end=$(date -I -d "$end_target + 1 day")
    next_day() { date -I -d "$1 + 1 day"; }
fi

while [ "$d" != "$end" ]; do
    for h in $(seq 0 23); do
        echo "https://data.gharchive.org/${d}-${h}.json.gz"
    done
    d=$(next_day "$d")
done
