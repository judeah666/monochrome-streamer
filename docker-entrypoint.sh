#!/bin/sh
set -eu

PUID="${PUID:-1000}"
PGID="${PGID:-1000}"
UMASK="${UMASK:-022}"
DATA_DIR="${DATA_DIR:-/data}"
COVER_CACHE_PATH="${COVER_CACHE_PATH:-${DATA_DIR}/covers}"
LYRICS_SIDECAR_PATH="${LYRICS_SIDECAR_PATH:-${DATA_DIR}/lyrics}"
NOAUTH="${NOAUTH:-false}"

umask "$UMASK"

if [ "$NOAUTH" != "true" ] && [ "${REQUIRE_ADMIN_CREDENTIALS:-true}" != "false" ]; then
  if [ -z "${ADMIN_USERNAME:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
    echo "ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env before starting Monochrome-Streamer." >&2
    exit 1
  fi

  if [ "${ADMIN_PASSWORD}" = "admin" ] || [ "${ADMIN_PASSWORD}" = "change-this-admin-password" ]; then
    echo "Change ADMIN_PASSWORD in .env before starting Monochrome-Streamer." >&2
    exit 1
  fi
fi

if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR" "$COVER_CACHE_PATH" "$LYRICS_SIDECAR_PATH"

  if [ "${CHOWN_DATA:-true}" != "false" ]; then
    chown -R "$PUID:$PGID" "$DATA_DIR" 2>/dev/null || true
  fi

  exec su-exec "$PUID:$PGID" "$@"
fi

exec "$@"
