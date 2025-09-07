#!/bin/bash
set -e
echo "[EB prebuild] Installing dependencies and building Next.js app..."
export NODE_OPTIONS="--max_old_space_size=2048"
if command -v npm >/dev/null 2>&1; then
  npm ci || npm install
  npm run build
else
  echo "npm not found" >&2
  exit 1
fi

