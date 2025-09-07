#!/usr/bin/env bash
set -euo pipefail

# Build the Next.js app and start it on a given port (default 3021)
# Usage:
#   ./build_and_start.sh                # uses PORT=3021, NEXT_PUBLIC_API_URL=http://localhost:8020/api
#   PORT=4000 NEXT_PUBLIC_API_URL=http://localhost:8020/api ./build_and_start.sh
#
# Notes:
# - Runs in production mode (npm run build; npm run start -p $PORT)
# - Prints the effective API base and port for clarity

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${PORT:-3021}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8020/api}"
export NODE_ENV=production

echo "[build] Starting production build for sabpaisa_admin_copy"
echo "[build] NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}"

if command -v npm >/dev/null 2>&1; then
  if [ -f package-lock.json ]; then
    echo "[build] Installing dependencies (npm ci) …"
    npm ci --silent
  else
    echo "[build] Installing dependencies (npm install) …"
    npm install --silent
  fi
  echo "[build] Running npm run build (this may take a while) …"
  npm run build
  echo "[start] Starting on port ${PORT}"
  npm run start -- -p "${PORT}"
else
  echo "[error] npm is not installed or not in PATH" >&2
  exit 1
fi

