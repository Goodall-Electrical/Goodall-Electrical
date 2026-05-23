#!/usr/bin/env bash
# Build the image, run it with throwaway env values, and verify the
# main routes respond. Intended for local sanity-check and CI.
#
# To exercise the real Fergus integration, pass FERGUS_API_KEY in the
# environment; otherwise it's stubbed to a non-network value.
set -euo pipefail

IMAGE="goodall-website:smoke"
CTR="goodall-smoke"
PORT="${SMOKE_PORT:-8765}"
FERGUS_API_BASE="${FERGUS_API_BASE:-https://api.fergus.example}"
FERGUS_API_KEY="${FERGUS_API_KEY:-fergPAT_dummy-key-for-smoke-test}"

cleanup() {
  docker rm -f "$CTR" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "==> Building image..."
docker build -t "$IMAGE" .

echo "==> Starting container..."
docker run -d --name "$CTR" \
  -p "$PORT:3000" \
  -e SMTP_HOST=smtp.example.invalid \
  -e SMTP_PORT=587 \
  -e SMTP_USER=u -e SMTP_PASS=p \
  -e SMTP_FROM=no-reply@example.com \
  -e GOODALL_INBOX=office@example.com \
  -e FERGUS_API_BASE="$FERGUS_API_BASE" \
  -e FERGUS_API_KEY="$FERGUS_API_KEY" \
  -e SUBMISSION_LOG_PATH=/tmp/submissions.jsonl \
  "$IMAGE"

echo "==> Waiting for /api/health..."
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:$PORT/api/health" >/dev/null; then
    echo "    health ok"
    break
  fi
  sleep 1
  if [ "$i" = "30" ]; then
    echo "    health check never passed"
    docker logs "$CTR"
    exit 1
  fi
done

echo "==> Checking key routes..."
for path in / /services /services/antennas /services/antennas/sale /contact /sitemap.xml; do
  code=$(curl -sf -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT$path")
  printf "    %-32s %s\n" "$path" "$code"
  if [ "$code" -ge "400" ]; then
    echo "    !!! $path returned $code"
    docker logs "$CTR"
    exit 1
  fi
done

echo "==> All smoke checks passed."
