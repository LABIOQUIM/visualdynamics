#!/bin/sh
set -e

# Ensure /files exists and is owned by appuser
if [ ! -d /files ]; then
  mkdir -p /files
fi
chown -R 1001:1001 /files

exec "$@"
