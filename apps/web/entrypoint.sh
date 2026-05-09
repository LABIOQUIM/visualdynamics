#!/bin/sh
set -e

cat > /app/dist/client/env-config.js <<EOF
window.__ENV__ = { API_URL: "${API_URL:-http://localhost:3001}" };
EOF

node /app/server/index.mjs &
node_pid=$!

cleanup() {
  kill "$node_pid"
  wait "$node_pid" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
