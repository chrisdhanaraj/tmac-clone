#!/usr/bin/env tsx

/**
 * Script to populate feeder data from Luma events
 * Fetches all events, identifies feeders from registration answers,
 * and updates the feeder table with counts and timestamps
 *
 * Run with: node --import tsx scripts/luma/populate-feeders.ts
 * Dry run: node --import tsx scripts/luma/populate-feeders.ts --dry-run
 * Use cache: node --import tsx scripts/luma/populate-feeders.ts --use-cache
 * Cache only: node --import tsx scripts/luma/populate-feeders.ts --cache-only
 *
 * Backfill guest data for specific events (for rate-limited or missed guest fetches):
 * node --import tsx scripts/luma/populate-feeders.ts --backfill=event1,event2,event3
 * or with JSON array:
 * node --import tsx scripts/luma/populate-feeders.ts --backfill='["event1","event2","event3"]'
 *
 * Note: Backfill mode requires events to already exist (use with --use-cache or after a full run)
 */

import "dotenv/config";

console.log(process.env);

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const { PrismaClient } = await import("../../app/generated/prisma");
const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const prisma = new PrismaClient();
// Configuration
const LUMA_API_KEY = process.env.LUMA_API_KEY;
const LUMA_API_BASE = "https://public-api.luma.com";
const DRY_RUN = process.argv.includes("--dry-run");
const USE_CACHE = process.argv.includes("--use-cache");
const CACHE_ONLY = process.argv.includes("--cache-only");
const CACHE_FILE = join(__dirname, "luma-data-cache.json");

// Check for backfill event IDs
const BACKFILL_EVENT_IDS = getBackfillEventIds();

// Types for Luma API responses
interface LumaEventEntry {
  api_id: string;
  event: {
    api_id: string;
    start_at: string;
    name: string;
    [key: string]: any;
  };
  tags?: any[];
}

interface RegistrationAnswer {
  label: string;
  answer: string | string[];
  question_id: string;
  question_type: string;
}

interface LumaGuestEntry {
  api_id: string;
  guest: {
    email: string;
    user_email?: string;
    name?: string;
    user_name?: string;
    registration_answers?: RegistrationAnswer[];
    approval_status?: string;
    registered_at?: string;
    [key: string]: any;
  };
}

/**
 * Get backfill event IDs from command line arguments
 */
function getBackfillEventIds(): string[] {
  const backfillArg = process.argv.find(arg => arg.startsWith("--backfill="));
  if (!backfillArg) return [];

  const idsString = backfillArg.split("=")[1];
  if (!idsString) return [];

  // Support both comma-separated and JSON array format
  try {
    // Try parsing as JSON array first
    return JSON.parse(idsString);
  } catch {
    // Fall back to comma-separated
    return idsString
      .split(",")
      .map(id => id.trim())
      .filter(Boolean);
  }
}

// Stats tracking
const stats = {
  eventsProcessed: 0,
  guestsChecked: 0,
  feedersIdentified: 0,
  usersMatched: 0,
  usersMissing: 0,
  errors: 0,
};

// Rate limiting for guest API calls
let guestApiCallCount = 0;

// Cache data structure
interface CacheData {
  fetchedAt: string;
  events: LumaEventEntry[];
  eventGuests: Record<string, LumaGuestEntry[]>; // eventId -> guests
}

/**
 * Fetch all events from the Luma calendar (handles pagination)
 */
async function fetchAllEvents(): Promise<LumaEventEntry[]> {
  console.log("📅 Fetching all events from Luma calendar...");
  console.log("🔑 Using API Key:", LUMA_API_KEY.substring(0, 10) + "...");

  const allEvents: LumaEventEntry[] = [];
  let cursor: string | null = null;
  let pageCount = 0;

  try {
    do {
      pageCount++;
      const url = new URL(`${LUMA_API_BASE}/v1/calendar/list-events`);

      url.searchParams.append("pagination_limit", "2000");

      if (cursor) {
        url.searchParams.append("pagination_cursor", cursor);
      }

      console.log(url.toString());

      console.log(`📡 Fetching page ${pageCount}...`);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-luma-api-key": LUMA_API_KEY,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.log("Response body:", text);
        throw new Error(
          `Failed to fetch events: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const pageEvents = data.entries || [];
      allEvents.push(...pageEvents);

      console.log(`   Found ${pageEvents.length} events on page ${pageCount}`);

      // Check if there are more pages
      cursor = data.has_more ? data.next_cursor : null;

      // Add delay between pages to avoid rate limiting
      if (cursor) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } while (cursor);

    console.log(
      `✅ Found ${allEvents.length} total events across ${pageCount} pages`
    );

    return allEvents;
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    throw error;
  }
}

/**
 * Fetch guests for a specific event (handles pagination)
 */
async function fetchEventGuests(eventId: string): Promise<LumaGuestEntry[]> {
  const allGuests: LumaGuestEntry[] = [];
  let cursor: string | null = null;
  let pageCount = 0;

  // Rate limiting: after every 10 events' guest fetches, wait 10 seconds
  guestApiCallCount++;
  if (guestApiCallCount % 10 === 0) {
    console.log(
      `\n⏳ Rate limiting: waiting 10 seconds after ${guestApiCallCount} events processed...`
    );
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  try {
    do {
      pageCount++;
      const url = new URL(
        `${LUMA_API_BASE}/v1/event/get-guests?approval_status=approved`
      );
      url.searchParams.append("event_api_id", eventId);

      if (cursor) {
        url.searchParams.append("pagination_cursor", cursor);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "x-luma-api-key": LUMA_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch guests for event ${eventId}: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const pageGuests = data.entries || [];
      allGuests.push(...pageGuests);

      // Check if there are more pages
      cursor = data.has_more ? data.next_cursor : null;

      // Add small delay between pages to avoid rate limiting
      if (cursor) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } while (cursor);

    return allGuests;
  } catch (error) {
    console.error(`❌ Error fetching guests for event ${eventId}:`, error);
    stats.errors++;
    return [];
  }
}

/**
 * Identify if a guest is a feeder based on registration answers
 */
function isFeeder(guestEntry: LumaGuestEntry): boolean {
  const { guest } = guestEntry;
  if (!guest.registration_answers || guest.registration_answers.length === 0)
    return false;

  // Look for contributor questions
  for (const answer of guest.registration_answers) {
    const questionLower = answer.label.toLowerCase();

    // Check for contributor questions
    if (
      questionLower.includes("contributor") ||
      questionLower.includes("contributing")
    ) {
      // Handle both single answer and multi-select
      if (typeof answer.answer === "string") {
        if (answer.answer === "Feeder") return true;
      } else if (Array.isArray(answer.answer)) {
        if (answer.answer.includes("Feeder")) return true;
      }
    }
  }

  return false;
}

/**
 * Update feeder record for a user
 */
async function updateFeederRecord(
  userId: string,
  eventDate: Date,
  email: string
): Promise<void> {
  if (DRY_RUN) {
    console.log(
      `   [DRY RUN] Would update feeder record for user ${userId} (${email})`
    );
    return;
  }

  try {
    // Get existing feeder record
    const existingFeeder = await prisma.feeder.findUnique({
      where: { userId },
    });

    if (existingFeeder) {
      // Update existing record
      await prisma.feeder.update({
        where: { userId },
        data: {
          count: existingFeeder.count + 1,
          lastFedAt: eventDate,
          // Don't update firstFedAt if it already exists
        },
      });
    } else {
      // Create new feeder record
      await prisma.feeder.create({
        data: {
          userId,
          count: 1,
          firstFedAt: eventDate,
          lastFedAt: eventDate,
        },
      });
    }

    stats.usersMatched++;
  } catch (error) {
    console.error(`❌ Error updating feeder record for user ${userId}:`, error);
    stats.errors++;
  }
}

/**
 * Process feeders from a list of guests
 */
async function processFeeders(
  guestEntries: LumaGuestEntry[],
  eventDate: Date
): Promise<void> {
  // Debug: Show structure of first guest with registration_answers
  const guestsWithAnswers = guestEntries.filter(
    entry =>
      entry.guest.registration_answers &&
      entry.guest.registration_answers.length > 0
  );

  const feeders = guestEntries.filter(isFeeder);
  stats.feedersIdentified += feeders.length;

  if (feeders.length === 0) return;

  console.log(`   🎾 Found ${feeders.length} feeders`);

  // Process feeders
  for (const feederEntry of feeders) {
    const feeder = feederEntry.guest;
    const email = feeder.email || feeder.user_email;

    if (!email) {
      console.log(
        `   ⚠️  Feeder without email: ${
          feeder.name || feeder.user_name || "Unknown"
        }`
      );
      continue;
    }

    if (DRY_RUN) {
      console.log(`   [DRY RUN] Would update feeder: ${email}`);
    } else {
      try {
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (user) {
          await updateFeederRecord(user.id, eventDate, email);
          console.log(`   ✅ Updated feeder: ${email}`);
        } else {
          stats.usersMissing++;
          console.log(`   ⚠️  User not found: ${email}`);
        }
      } finally {
        await prisma.$disconnect();
      }
    }
  }
}

/**
 * Load data from cache file
 */
function loadFromCache(): CacheData | null {
  if (!existsSync(CACHE_FILE)) {
    console.log("❌ Cache file not found:", CACHE_FILE);
    return null;
  }

  try {
    const cacheContent = readFileSync(CACHE_FILE, "utf-8");
    const cache = JSON.parse(cacheContent) as CacheData;
    console.log(`✅ Loaded cache from ${cache.fetchedAt}`);
    console.log(`   Events: ${cache.events.length}`);
    console.log(
      `   Event guest data: ${Object.keys(cache.eventGuests).length} events`
    );
    return cache;
  } catch (error) {
    console.error("❌ Error loading cache:", error);
    return null;
  }
}

/**
 * Save data to cache file
 */
function saveToCache(
  events: LumaEventEntry[],
  eventGuests: Record<string, LumaGuestEntry[]>
) {
  const cache: CacheData = {
    fetchedAt: new Date().toISOString(),
    events,
    eventGuests,
  };

  try {
    writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`\n💾 Saved API data to cache: ${CACHE_FILE}`);
  } catch (error) {
    console.error("❌ Error saving cache:", error);
  }
}

/**
 * Main function to populate feeder data
 */
async function populateFeeders() {
  console.log("🚀 Starting feeder population script...");

  // Show operation mode
  if (BACKFILL_EVENT_IDS.length > 0) {
    console.log(
      `🔄 Running in BACKFILL mode - fetching guest data for ${BACKFILL_EVENT_IDS.length} specific events\n`
    );
    console.log("Event IDs to backfill guests for:", BACKFILL_EVENT_IDS);
  }
  if (CACHE_ONLY) {
    console.log(
      "💾 Running in CACHE ONLY mode - will fetch data and save to cache only\n"
    );
  } else if (DRY_RUN) {
    console.log(
      "🔍 Running in DRY RUN mode - no database changes will be made\n"
    );
  }
  if (USE_CACHE && BACKFILL_EVENT_IDS.length === 0) {
    console.log("📂 Using cached data instead of API calls\n");
  }

  try {
    let events: LumaEventEntry[];
    const eventGuests: Record<string, LumaGuestEntry[]> = {};

    if (USE_CACHE && !CACHE_ONLY) {
      // Load from cache
      const cache = loadFromCache();
      if (!cache) {
        console.log(
          "💡 Run without --use-cache to fetch fresh data from Luma API"
        );
        return;
      }
      events = cache.events;
      Object.assign(eventGuests, cache.eventGuests);

      // Ensure events are sorted (cache should already be sorted)
      events.sort(
        (a, b) =>
          new Date(a.event.start_at).getTime() -
          new Date(b.event.start_at).getTime()
      );
    } else {
      // Fetch all events from API
      events = await fetchAllEvents();

      // Sort events by date (oldest first) to ensure proper firstFedAt tracking
      events.sort(
        (a, b) =>
          new Date(a.event.start_at).getTime() -
          new Date(b.event.start_at).getTime()
      );

      // Fetch guests for each event
      if (BACKFILL_EVENT_IDS.length > 0) {
        console.log(
          `\n📥 Fetching guest data for ${BACKFILL_EVENT_IDS.length} backfill events...`
        );
        // Only fetch guests for specified events
        const backfillEvents = events.filter(e =>
          BACKFILL_EVENT_IDS.includes(e.event.api_id)
        );

        if (backfillEvents.length === 0) {
          console.log(
            "❌ None of the specified event IDs were found in the event list"
          );
          return;
        }

        console.log(
          `✅ Found ${backfillEvents.length}/${BACKFILL_EVENT_IDS.length} events to backfill`
        );

        for (const eventEntry of backfillEvents) {
          const event = eventEntry.event;
          console.log(`\n📍 Fetching guests for: ${event.name}`);

          const guests = await fetchEventGuests(event.api_id);
          eventGuests[event.api_id] = guests;

          if (guests.length > 0) {
            console.log(`   Found ${guests.length} guests`);
          }
        }
      } else {
        console.log("\n📥 Fetching guest data for all events...");
        for (const eventEntry of events) {
          const event = eventEntry.event;
          console.log(`\n📍 Fetching guests for: ${event.name}`);

          const guests = await fetchEventGuests(event.api_id);
          eventGuests[event.api_id] = guests;

          if (guests.length > 0) {
            console.log(`   Found ${guests.length} guests`);
          }
        }
      }

      // Save to cache (but not in backfill mode)
      if (BACKFILL_EVENT_IDS.length === 0) {
        saveToCache(events, eventGuests);
      }

      // If cache-only mode, exit here
      if (CACHE_ONLY) {
        console.log("\n📊 Cache Summary:");
        console.log("═══════════════════════════════════════");
        console.log(`Events fetched:      ${events.length}`);
        console.log(
          `Total guests data:   ${Object.values(eventGuests).reduce(
            (sum, guests) => sum + guests.length,
            0
          )}`
        );
        console.log(`Cache file:          ${CACHE_FILE}`);
        console.log("═══════════════════════════════════════");
        console.log("\n✅ Cache-only mode complete! Data saved successfully.");
        return;
      }
    }

    // Process events
    console.log("\n🔄 Processing events and identifying feeders...");

    // In backfill mode, only process events we fetched guests for
    const eventsToProcess =
      BACKFILL_EVENT_IDS.length > 0
        ? events.filter(e => BACKFILL_EVENT_IDS.includes(e.event.api_id))
        : events;

    for (const eventEntry of eventsToProcess) {
      stats.eventsProcessed++;
      const event = eventEntry.event;
      const guests = eventGuests[event.api_id] || [];

      console.log(
        `\n📍 Processing event: ${event.name} (${new Date(
          event.start_at
        ).toLocaleDateString()})`
      );

      stats.guestsChecked += guests.length;

      if (guests.length === 0) {
        console.log("   No guests found");
        continue;
      }

      console.log(`   Found ${guests.length} guests`);

      // Process feeders
      await processFeeders(guests, new Date(event.start_at));

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Print summary
    console.log("\n📊 Summary:");
    console.log("═══════════════════════════════════════");
    if (BACKFILL_EVENT_IDS.length > 0) {
      console.log(
        `Mode:                BACKFILL (${BACKFILL_EVENT_IDS.length} events)`
      );
    }
    console.log(`Events processed:    ${stats.eventsProcessed}`);
    console.log(`Guests checked:      ${stats.guestsChecked}`);
    console.log(`Feeders identified:  ${stats.feedersIdentified}`);
    console.log(`Users matched:       ${stats.usersMatched}`);
    console.log(`Users not found:     ${stats.usersMissing}`);
    console.log(`Errors encountered:  ${stats.errors}`);
    console.log(
      `Guest API calls:     ${guestApiCallCount} events' guests fetched`
    );
    console.log("═══════════════════════════════════════");

    if (DRY_RUN) {
      console.log("\n✅ Dry run completed successfully!");
      console.log("Run without --dry-run flag to update the database.");
    } else if (BACKFILL_EVENT_IDS.length > 0) {
      console.log("\n✅ Backfill completed!");
    } else {
      console.log("\n✅ Feeder data population completed!");
    }
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
populateFeeders();
