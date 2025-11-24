import prisma from "../../config/prisma.js";
import {
  MatchRequestPayloadSchema,
  type MatchRequestResponse,
} from "@tmac/shared/contracts/chat";
import { logger } from "@tmac/shared/logger";
import type { TennisRanking } from "../../generated/prisma/enums.js";

// Helper to format ranking enum to string (e.g. "THREE_FIVE" -> "3.5")
function formatRanking(
  ranking: TennisRanking | null | undefined
): string | undefined {
  if (!ranking) return undefined;
  const map: Record<string, string> = {
    ONE_ZERO: "1.0",
    ONE_FIVE: "1.5",
    TWO_ZERO: "2.0",
    TWO_FIVE: "2.5",
    TWO_SEVEN_FIVE: "2.75",
    THREE_ZERO: "3.0",
    THREE_TWO_FIVE: "3.25",
    THREE_FIVE: "3.5",
    THREE_SEVEN_FIVE: "3.75",
    FOUR_ZERO: "4.0",
    FOUR_TWO_FIVE: "4.25",
    FOUR_FIVE: "4.5",
    FOUR_SEVEN_FIVE: "4.75",
    FIVE_ZERO: "5.0",
    FIVE_FIVE: "5.5",
    SIX_ZERO: "6.0",
    SIX_FIVE: "6.5",
    SEVEN_ZERO: "7.0",
  };
  return map[ranking] || undefined;
}

export async function createMatchRequest(request: Request) {
  try {
    const body = await request.json();
    const payload = MatchRequestPayloadSchema.parse(body);
    const {
      discordUserId,
      court,
      date,
      time,
      level,
      notes,
      matchType,
      channelId,
    } = payload;

    // Try to find user by Discord ID
    const user = await prisma.user.findFirst({
      where: {
        discordId: discordUserId,
      },
      include: {
        tennisProfile: true,
      },
    });

    const playerRating = formatRanking(user?.tennisProfile?.tennisRanking);

    const matchRequest: MatchRequestResponse = {
      id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      discordUserId,
      court,
      date,
      time,
      level,
      notes,
      matchType,
      status: "open",
      createdAt: new Date(),
      channelId,
      playerRating,
    };

    // For now, we'll just return the match request
    // In the future, this could be stored in a database table
    logger.info({ matchRequest }, "Created match request");

    return new Response(JSON.stringify(matchRequest), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error(error, "Error creating match request");
    return new Response(
      JSON.stringify({ error: "Failed to create match request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
