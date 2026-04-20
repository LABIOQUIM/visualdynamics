#!/bin/sh
set -e

cat > /usr/share/caddy/env-config.js <<EOF
window.__ENV__ = { API_URL: "${API_URL:-http://localhost:3001}" };
EOF

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
