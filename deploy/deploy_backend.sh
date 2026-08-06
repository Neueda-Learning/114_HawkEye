#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="${1:?project root is required}"
COMPOSE_FILE="${2:-$PROJECT_ROOT/deploy/docker-compose.app.yml}"

cd "$PROJECT_ROOT/deploy"

if docker compose version >/dev/null 2>&1; then
  docker compose -f "$COMPOSE_FILE" up -d --build backend
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose -f "$COMPOSE_FILE" up -d --build backend
else
  echo "Docker Compose is not installed" >&2
  exit 1
fi

echo "Backend container deployed using $COMPOSE_FILE"

