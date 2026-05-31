#!/bin/sh
set -e

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
