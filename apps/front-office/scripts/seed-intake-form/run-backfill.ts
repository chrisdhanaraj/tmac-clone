#!/usr/bin/env tsx

/**
 * Script runner for backfilling approval status
 *
 * Usage:
 *   npm run backfill:approval
 *   or
 *   npx tsx scripts/seed-intake-form/run-backfill.ts
 */

import { backfillApprovalStatus } from "./backfill-approval";

async function main() {
  console.log("🎯 Running approval status backfill...\n");

  try {
    await backfillApprovalStatus();
  } catch (error) {
    console.error("💥 Backfill failed:", error);
    process.exit(1);
  }
}

main();
