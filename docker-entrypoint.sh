#!/bin/sh
set -eu

PUID="${PUID:-1000}"
PGID="${PGID:-1000}"
UMASK="${UMASK:-022}"
DATA_DIR="${DATA_DIR:-/data}"
COVER_CACHE_PATH="${COVER_CACHE_PATH:-${DATA_DIR}/covers}"
LYRICS_SIDECAR_PATH="${LYRICS_SIDECAR_PATH:-${DATA_DIR}/lyrics}"

umask "$UMASK"

if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR" "$COVER_CACHE_PATH" "$LYRICS_SIDECAR_PATH"

  if [ "${CHOWN_DATA:-true}" != "false" ]; then
    chown -R "$PUID:$PGID" "$DATA_DIR" 2>/dev/null || true
  fi

  exec su-exec "$PUID:$PGID" "$@"
fi

exec "$@"
