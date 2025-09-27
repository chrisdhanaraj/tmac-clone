# Luma Scripts

## populate-feeders.ts

This script syncs feeder data from Luma events to the database.

### What it does:

1. Fetches all events from your Luma calendar
2. For each event, gets the guest list
3. Identifies guests who registered as feeders (based on registration_answers)
4. Matches them to users in the database by email
5. Updates the `feeder` table with:
   - `count`: Number of times they've fed
   - `firstFedAt`: Date of their first feeder event
   - `lastFedAt`: Date of their most recent feeder event

### Usage:

```bash
# Just fetch and cache data (no database operations)
node --import tsx scripts/luma/populate-feeders.ts --cache-only

# Dry run with fresh API data
node --import tsx scripts/luma/populate-feeders.ts --dry-run

# Use cached data (no API calls)
node --import tsx scripts/luma/populate-feeders.ts --use-cache --dry-run

# Actual run with fresh API data
node --import tsx scripts/luma/populate-feeders.ts

# Actual run with cached data
node --import tsx scripts/luma/populate-feeders.ts --use-cache

# Backfill guest data for specific events (typically used with cached event data)
node --import tsx scripts/luma/populate-feeders.ts --use-cache --backfill=event1,event2,event3

# Backfill with JSON array format
node --import tsx scripts/luma/populate-feeders.ts --use-cache --backfill='["event1","event2","event3"]'

# Backfill with dry run to test first
node --import tsx scripts/luma/populate-feeders.ts --use-cache --backfill=event1,event2 --dry-run
```

### Backfill Mode:

The `--backfill` option allows you to fetch guest data for specific events that had their guests missed due to rate limiting:

- Accepts event IDs as comma-separated values or JSON array
- Requires events to already exist (use with `--use-cache` or after a full run)
- Only fetches guest data for the specified events, not the event details
- Does not update the cache file (only processes specified events)
- Useful for fixing gaps in guest data without reprocessing everything
- Can be combined with `--dry-run` to test before updating the database

Example use cases:

- Guest data that failed to fetch due to rate limiting
- Events where guest list fetching timed out or errored
- Re-fetching guest data after attendees were added/updated

Important: The events must already be loaded (either from cache or a previous run). If you need to fetch entirely new events, run the script without backfill mode.

### Caching:

- The script saves all API responses to `luma-data-cache.json`
- Use `--cache-only` to only fetch and save data (no database operations)
- Use `--use-cache` to skip API calls and use cached data
- This is helpful for debugging database logic without hitting API limits
- Cache file includes timestamp of when data was fetched
- **Note**: Backfill mode does not use or update the cache

### Configuration:

- API Key is already set in the script: `secret-EUq5CWfZBHxblE1wz7XtxBPOa`
- You can also set it via environment variable: `LUMA_API_KEY`

### Feeder Identification:

The script identifies feeders by checking `registration_answers` for patterns like:

- Questions containing "feeder" with affirmative answers
- Role selections that include "Feeder"
- Checkbox values for feeder-related questions

### Important Notes:

- **Pagination Handling**: The script automatically fetches ALL events and ALL guests (handles API pagination)
- **Rate Limiting**: Waits 10 seconds after every 10 guest API calls to respect Luma's rate limits
- The script processes events chronologically to ensure `firstFedAt` is accurate
- Only users with matching emails in the database will be updated
- Unmatched feeders are logged for manual review
- The script includes additional rate limiting delays between API calls
- No artificial limits - processes all available data from Luma

### Recommended Workflow:

1. **Fetch data only** (safe, no DB changes):

   ```bash
   node --import tsx scripts/luma/populate-feeders.ts --cache-only
   ```

2. **Test with cached data** (instant, repeatable):

   ```bash
   node --import tsx scripts/luma/populate-feeders.ts --use-cache --dry-run
   ```

3. **Run for real** when ready:
   ```bash
   node --import tsx scripts/luma/populate-feeders.ts --use-cache
   ```

### Troubleshooting:

- If you get authentication errors, verify the API key is correct
- Check the console output for unmatched users (they may need to be added to the database)
- Review the summary statistics to ensure feeders are being identified correctly
