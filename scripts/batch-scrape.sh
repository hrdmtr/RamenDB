#!/bin/bash

# Batch scraping script for comprehensive ramen shop data collection
# Usage: ./scripts/batch-scrape.sh

echo "=== Starting batch scrape ==="
echo ""

# Define areas to search (stations around Machida)
AREAS=(
  "成瀬駅"
  "町田駅"
  "鶴川駅"
  "相模大野駅"
  "つきみ野駅"
  "中央林間駅"
)

# Define keywords to search
KEYWORDS=(
  "ラーメン"
  "ラーメンショップ"
  "中華そば"
  "つけ麺"
  "家系ラーメン"
  "二郎系"
)

# Loop through each area and keyword combination
for area in "${AREAS[@]}"; do
  for keyword in "${KEYWORDS[@]}"; do
    echo "---"
    echo "Searching: Area='${area}' Keyword='${keyword}'"
    echo "---"
    npm run scrape-places -- --area="${area}" --query="${keyword}" --radius=3000
    echo ""
    # Wait a bit between searches to avoid rate limiting
    sleep 3
  done
done

echo ""
echo "=== Batch scrape complete ==="
echo "Check logs/ directory for detailed results"
