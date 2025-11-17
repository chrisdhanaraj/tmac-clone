import prisma from "../../config/prisma.js";
import {
  MatchRequestPayloadSchema,
  type MatchRequestResponse,
} from "@tmac/shared/contracts/chat";
import { logger } from "@tmac/shared/logger";

export async function createMatchRequest(request: Request) {
  try {
    const body = await request.json();
    const { discordUserId, location, channelId } =
      MatchRequestPayloadSchema.parse(body);

    // Try to find user by Discord ID
    const user = await prisma.user.findFirst({
      where: {
        discordId: discordUserId,
      },
      include: {
        tennisProfile: true,
      },
    });

    if (!user) {
      // Return a match request response with a helpful message
      const matchRequest: MatchRequestResponse = {
        id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        discordUserId,
        location,
        status: "open",
        createdAt: new Date(),
        channelId,
      };
      
      return new Response(JSON.stringify(matchRequest), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create match request
    const matchRequest: MatchRequestResponse = {
      id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      discordUserId,
      location,
      status: "open",
      createdAt: new Date(),
      channelId,
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
