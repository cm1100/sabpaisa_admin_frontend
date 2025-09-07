#!/usr/bin/env bash
set -euo pipefail

# Background runner for Clients E2E only
# Backend must already be running on 8020.
# Usage:
#   cd sabpaisa_admin_copy
#   E2E_FRONTEND_PORT=3035 E2E_USER=admin@sabpaisa.com E2E_PASS=admin123 ./scripts/run_clients_e2e_bg.sh

ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
cd "$ROOT_DIR"

PORT="${E2E_FRONTEND_PORT:-3035}"
E2E_FRONTEND_URL="${E2E_FRONTEND_URL:-http://localhost:${PORT}}"
E2E_API_URL="${E2E_API_URL:-http://localhost:8020/api}"
E2E_USER="${E2E_USER:-admin@sabpaisa.com}"
E2E_PASS="${E2E_PASS:-admin123}"

LOG_DIR="${LOG_DIR:-../e2e-logs}"
mkdir -p "$LOG_DIR"
FE_LOG="$LOG_DIR/frontend_${PORT}.log"
PW_LOG="$LOG_DIR/playwright_clients_${PORT}.log"
PID_FILE="$LOG_DIR/next_${PORT}.pid"

echo "[e2e-bg] FE=$E2E_FRONTEND_URL API=$E2E_API_URL USER=$E2E_USER PORT=$PORT"

echo "[e2e-bg] Building Next.js..."
npm run build > "$LOG_DIR/build_${PORT}.log" 2>&1 || { echo "[e2e-bg] Build failed. See $LOG_DIR/build_${PORT}.log"; exit 3; }

echo "[e2e-bg] Starting Next.js on :$PORT (logs: $FE_LOG) ..."
nohup npx next start -p "$PORT" > "$FE_LOG" 2>&1 &
NEXT_PID=$!
echo "$NEXT_PID" > "$PID_FILE"

echo "[e2e-bg] Waiting for Next.js to be ready..."
for i in $(seq 1 90); do
  if curl -sSf "${E2E_FRONTEND_URL}" >/dev/null; then
    echo "[e2e-bg] Next.js is up (pid=$NEXT_PID)"
    break
  fi
  sleep 1
  if [ $i -eq 90 ]; then
    echo "[e2e-bg] Next.js failed to start. Check $FE_LOG"
    exit 2
  fi
done

echo "[e2e-bg] Running Playwright Clients spec in background (logs: $PW_LOG) ..."
(
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
) > "$PW_LOG" 2>&1 &

PW_PID=$!
echo "[e2e-bg] Playwright PID=$PW_PID. Tail logs: tail -f $PW_LOG | sed -n '1,200p'"
echo "[e2e-bg] To stop Next.js: kill $(cat $PID_FILE)"

exit 0
