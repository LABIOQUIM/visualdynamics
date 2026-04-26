#!/bin/sh
set -e

EXPECTED_UID=1001
EXPECTED_GID=1001
PROBE_PATH="/files/.write-test.$$"

if [ ! -d /files ]; then
  echo "Error: /files does not exist. The container expects /files to be present and writable by UID:GID ${EXPECTED_UID}:${EXPECTED_GID}." >&2
  exit 1
fi

if ! touch "$PROBE_PATH" 2>/dev/null; then
  echo "Error: /files is not writable by UID:GID $(id -u):$(id -g). Configure the mounted volume so UID:GID ${EXPECTED_UID}:${EXPECTED_GID} can write to /files." >&2
  exit 1
fi

rm -f "$PROBE_PATH"

exec "$@"
