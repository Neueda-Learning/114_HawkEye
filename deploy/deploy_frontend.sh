#!/usr/bin/env bash
set -euo pipefail

DIST_DIR="${1:?frontend dist directory is required}"
DEPLOY_DIR="${2:?frontend deploy directory is required}"
BACKEND_BASE_URL="${3:-http://127.0.0.1:8080}"
FRONTEND_PORT="${4:-4173}"

mkdir -p "$DEPLOY_DIR"
rm -rf "$DEPLOY_DIR/dist"
mkdir -p "$DEPLOY_DIR/dist"
cp -R "$DIST_DIR"/. "$DEPLOY_DIR/dist/"
cp "deploy/frontend-server.js" "$DEPLOY_DIR/frontend-server.js"

pkill -f "$DEPLOY_DIR/frontend-server.js" || true
nohup env FRONTEND_DIST_DIR="$DEPLOY_DIR/dist" BACKEND_BASE_URL="$BACKEND_BASE_URL" FRONTEND_PORT="$FRONTEND_PORT" node "$DEPLOY_DIR/frontend-server.js" > "$DEPLOY_DIR/frontend.out.log" 2> "$DEPLOY_DIR/frontend.err.log" < /dev/null &

echo "Frontend deployed to $DEPLOY_DIR/dist on port $FRONTEND_PORT"

