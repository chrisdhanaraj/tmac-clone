#!/usr/bin/env bash
set -euo pipefail

log() {
  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "[daily-sync-cron] ${timestamp} $*"
}

FRONT_OFFICE_BASE_URL="${FRONT_OFFICE_BASE_URL:-https://frontoffice.missionathletic.club}"
SYNC_SECRET="${SYNC_SECRET:-}"
SYNC_HEADER="x-sync-secret"

if [[ -z "${SYNC_SECRET}" ]]; then
  log "SYNC_SECRET env var must be set"
  exit 1
fi

BASE_URL_TRIMMED="${FRONT_OFFICE_BASE_URL%/}"
TARGET_URL="${BASE_URL_TRIMMED}/api/sheets-to-db-sync"
REQUEST_ID=$(uuidgen 2>/dev/null || echo "sync-$$-${RANDOM}")
START_TIME=$(date +%s)

log "Triggering sync request_id=${REQUEST_ID} target=${TARGET_URL}"

response_tmp="$(mktemp)"
trap 'rm -f "${response_tmp}"' EXIT

set +e
http_status=$(curl --fail-with-body --show-error --silent \
  -H "${SYNC_HEADER}: ${SYNC_SECRET}" \
  -H "Accept: application/json" \
  --write-out "%{http_code}" \
  --output "${response_tmp}" \
  "${TARGET_URL}")
curl_exit=$?
set -e

response_body="$(cat "${response_tmp}")"
rm -f "${response_tmp}"
trap - EXIT

END_TIME=$(date +%s)
duration=$((END_TIME - START_TIME))

if [[ ${curl_exit} -ne 0 ]]; then
  log "Sync failed request_id=${REQUEST_ID} curl_exit=${curl_exit} http_status=${http_status}"
  log "Response body: ${response_body:-<empty>}"
  exit "${curl_exit}"
fi

if [[ "${http_status}" -ge 400 ]]; then
  log "Sync completed with HTTP error request_id=${REQUEST_ID} http_status=${http_status}"
  log "Response body: ${response_body:-<empty>}"
  exit 1
fi

log "Sync completed successfully request_id=${REQUEST_ID} duration=${duration}s http_status=${http_status}"
log "Response body: ${response_body:-<empty>}"
