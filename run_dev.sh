#!/usr/bin/env bash
set -euo pipefail

# Run Next.js dev server on a given port (default 3020)
PORT="${1:-3021}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f package.json ]; then
  echo "[run_dev] package.json not found in sabpaisa_admin_copy"
  exit 1
fi

echo "[run_dev] Installing frontend dependencies if needed…"
npm install --silent

echo "[run_dev] Starting Next.js dev server on port ${PORT}"
npm run dev -- -p "${PORT}"

