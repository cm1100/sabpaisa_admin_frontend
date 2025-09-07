#!/usr/bin/env bash
set -euo pipefail

# Simple orchestrator to run Clients module e2e against local backend
# Usage: E2E_FRONTEND_URL=http://localhost:3021 E2E_API_URL=http://localhost:8020/api ./scripts/run_clients_e2e.sh

ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
cd "$ROOT_DIR"

PORT="${E2E_FRONTEND_PORT:-3021}"
E2E_FRONTEND_URL="${E2E_FRONTEND_URL:-http://localhost:${PORT}}"
E2E_API_URL="${E2E_API_URL:-http://localhost:8020/api}"
E2E_USER="${E2E_USER:-admin@sabpaisa.com}"
E2E_PASS="${E2E_PASS:-admin123}"

echo "[e2e] Using FE: $E2E_FRONTEND_URL | API: $E2E_API_URL"

# Build only if missing .next/server
if [ ! -d .next/server ]; then
  echo "[e2e] Building Next.js production bundle..."
  npm run build
fi

echo "[e2e] Starting Next.js on :$PORT ..."
LOG_FILE="../frontend_e2e.log"
nohup npx next start -p "$PORT" > "$LOG_FILE" 2>&1 &
NEXT_PID=$!

cleanup() {
  echo "[e2e] Stopping Next.js (pid=$NEXT_PID)"
  kill "$NEXT_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Wait for startup
for i in $(seq 1 60); do
  if curl -sSf "${E2E_FRONTEND_URL}" >/dev/null; then
    echo "[e2e] Next.js is up"
    break
  fi
  sleep 1
done

echo "[e2e] Running Playwright Clients spec..."
E2E_FRONTEND_URL="$E2E_FRONTEND_URL" \
E2E_API_URL="$E2E_API_URL" \
E2E_USER="$E2E_USER" \
E2E_PASS="$E2E_PASS" \
npx playwright test tests/e2e/clients.spec.ts \
  --project=chromium \
  --reporter=line \
  --workers=2 \
  --trace=off \
  --video=off

echo "[e2e] Done. Logs: $LOG_FILE"

