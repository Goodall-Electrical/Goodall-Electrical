#!/usr/bin/env bash
set -euo pipefail

IMAGE="goodall-website:smoke"
CTR="goodall-smoke"
PORT=8765

cleanup() {
  docker rm -f "$CTR" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Building image..."
docker build -t "$IMAGE" .

echo "Starting container..."
docker run -d --name "$CTR" \
  -p "$PORT:3000" \
  -e SMTP_HOST=smtp.example.invalid \
  -e SMTP_PORT=587 \
  -e SMTP_USER=u -e SMTP_PASS=p \
  -e SMTP_FROM=no-reply@x.com \
  -e GOODALL_INBOX=office@x.com \
  -e FERGUS_API_BASE=https://api.fergus.example \
  -e FERGUS_API_KEY=test \
  -e SUBMISSION_LOG_PATH=/tmp/submissions.jsonl \
  "$IMAGE"

echo "Waiting for /api/health..."
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:$PORT/api/health" >/dev/null; then
    echo "  health ok"
    break
  fi
  sleep 1
  if [ "$i" = "30" ]; then
    echo "  health check never passed"
    docker logs "$CTR"
    exit 1
  fi
done

echo "Checking home page renders..."
curl -sf "http://127.0.0.1:$PORT/" | grep -q "Goodall" || {
  echo "Home page did not contain 'Goodall'"
  exit 1
}

echo "Checking /quote renders..."
curl -sf "http://127.0.0.1:$PORT/quote" | grep -q -i "quote" || {
  echo "Quote page did not render"
  exit 1
}

echo "All smoke checks passed."
