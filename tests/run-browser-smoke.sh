#!/bin/sh
set -eu

CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
CHROME_PROFILE="/tmp/tfm-tracker-browser-smoke"

"$CHROME_PATH" \
  --headless=new \
  --no-first-run \
  --disable-gpu \
  --disable-background-networking \
  --user-data-dir="$CHROME_PROFILE" \
  --remote-debugging-port=9222 \
  about:blank >/tmp/tfm-tracker-browser-smoke.log 2>&1 &
CHROME_PID=$!
trap 'kill "$CHROME_PID" 2>/dev/null || true' EXIT

attempt=0
until curl --silent --fail http://127.0.0.1:9222/json/version >/dev/null; do
  attempt=$((attempt + 1))
  [ "$attempt" -lt 20 ] || { echo "Chrome debugging endpoint did not start"; exit 1; }
  sleep 0.25
done

node tests/browser-smoke.js
