#!/bin/sh
set -eu

PUID="${PUID:-1000}"
PGID="${PGID:-1000}"
UMASK="${UMASK:-022}"
DATA_DIR="${DATA_DIR:-/data}"
COVER_CACHE_PATH="${COVER_CACHE_PATH:-${DATA_DIR}/covers}"
LYRICS_SIDECAR_PATH="${LYRICS_SIDECAR_PATH:-${DATA_DIR}/lyrics}"
NOAUTH="${NOAUTH:-true}"

umask "$UMASK"

if [ "$NOAUTH" != "true" ] && [ "${REQUIRE_ADMIN_CREDENTIALS:-true}" != "false" ]; then
  if [ -z "${ADMIN_USERNAME:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
    echo "ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env before starting Monochrome-Streamer." >&2
    exit 1
  fi
fi

if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR" "$COVER_CACHE_PATH" "$LYRICS_SIDECAR_PATH"

  can_write_as_target() {
    target_dir="$1"
    test_file="${target_dir}/.monochrome-write-test-$$"
    su-exec "$PUID:$PGID" sh -c 'touch "$1" && rm -f "$1"' sh "$test_file" 2>/dev/null
  }

  chown_data_mode="${CHOWN_DATA:-auto}"
  if [ "$chown_data_mode" = "true" ]; then
    echo "[startup] CHOWN_DATA=true: recursively fixing data ownership"
    chown -R "$PUID:$PGID" "$DATA_DIR" "$COVER_CACHE_PATH" "$LYRICS_SIDECAR_PATH" 2>/dev/null || true
  elif [ "$chown_data_mode" = "false" ]; then
    echo "[startup] CHOWN_DATA=false: skipping data ownership check"
  else
    if can_write_as_target "$DATA_DIR" \
      && can_write_as_target "$COVER_CACHE_PATH" \
      && can_write_as_target "$LYRICS_SIDECAR_PATH"; then
      echo "[startup] CHOWN_DATA=auto: data paths already writable"
    else
      echo "[startup] CHOWN_DATA=auto: fixing data ownership"
      chown -R "$PUID:$PGID" "$DATA_DIR" "$COVER_CACHE_PATH" "$LYRICS_SIDECAR_PATH" 2>/dev/null || true
    fi
  fi

  exec su-exec "$PUID:$PGID" "$@"
fi

exec "$@"
