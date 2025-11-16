# Daily Sync Cron

This directory hosts a small bash script designed for Render.com's cron jobs. The script triggers the front-office sync endpoint so Google Sheet intake data reaches the database on a schedule.

## Files

- `sync.sh` – performs the authenticated request to the sync endpoint.

## Environment variables

- `SYNC_SECRET` (required): must match the `SYNC_SECRET` configured by `apps/front-office` so the request is authorized (`x-sync-secret` header).
- `FRONT_OFFICE_BASE_URL` (optional): override the base URL for front-office. Defaults to `https://frontoffice.missionathletic.club`.

## Running locally or on Render

Invoke the script from the repo root so relative paths resolve correctly:

```
bash apps/daily-sync-cron/sync.sh
```

Render cron job example values:

- **Command:** `bash apps/daily-sync-cron/sync.sh`
- **Schedule:** choose any cadence (e.g., daily at 1am PT).
- **Env vars:** set `SYNC_SECRET` (and `FRONT_OFFICE_BASE_URL` if overriding) in the Render service.

## Troubleshooting

- `Missing SYNC_SECRET`: ensure the env var is defined before running the script.
- `401 Unauthorized`: the provided secret does not match front-office.
- `5xx errors`: inspect Render logs and the front-office deployment for runtime failures.
