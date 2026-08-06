#!/usr/bin/env bash
set -euo pipefail

ARTIFACT_DIR="${1:?artifact directory is required}"
DEPLOY_DIR="${2:?deploy directory is required}"
JAR_PATH="$(find "$ARTIFACT_DIR" -maxdepth 1 -type f -name '*.jar' ! -name '*sources.jar' ! -name '*javadoc.jar' | head -n 1)"

if [[ -z "${JAR_PATH:-}" ]]; then
  echo "No backend jar found in $ARTIFACT_DIR" >&2
  exit 1
fi

mkdir -p "$DEPLOY_DIR"
cp "$JAR_PATH" "$DEPLOY_DIR/app.jar"

pkill -f "$DEPLOY_DIR/app.jar" || true
nohup java -jar "$DEPLOY_DIR/app.jar" > "$DEPLOY_DIR/backend.out.log" 2> "$DEPLOY_DIR/backend.err.log" < /dev/null &

echo "Backend deployed to $DEPLOY_DIR/app.jar"

