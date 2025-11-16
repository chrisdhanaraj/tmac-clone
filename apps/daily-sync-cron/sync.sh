#!/usr/bin/env bash
set -euo pipefail

FRONT_OFFICE_BASE_URL="${FRONT_OFFICE_BASE_URL:-https://frontoffice.missionathletic.club}"
SYNC_SECRET="${SYNC_SECRET:-}"
SYNC_HEADER="x-sync-secret"

if [[ -z "${SYNC_SECRET}" ]]; then
  echo "[daily-sync-cron] SYNC_SECRET env var must be set" >&2
  exit 1
fi

BASE_URL_TRIMMED="${FRONT_OFFICE_BASE_URL%/}"
TARGET_URL="${BASE_URL_TRIMMED}/api/sheets-to-db-sync"

echo "[daily-sync-cron] Triggering sync at ${TARGET_URL}"

response=$(curl --fail-with-body --show-error --silent \
  -H "${SYNC_HEADER}: ${SYNC_SECRET}" \
  -H "Accept: application/json" \
  "${TARGET_URL}")

echo "[daily-sync-cron] Sync completed successfully"
echo "[daily-sync-cron] Response: ${response}"
