import { z } from "zod";
import prisma from "../../config/prisma.js";

const MatchRequestSchema = z.object({
  discordUserId: z.string(),
  location: z.string(),
  channelId: z.string().optional(),
});

export type MatchRequest = {
  id: string;
  discordUserId: string;
  location: string;
  status: "open" | "matched" | "completed";
  createdAt: Date;
  channelId?: string;
};

export async function createMatchRequest(request: Request) {
  try {
    const body = await request.json();
    const { discordUserId, location, channelId } =
      MatchRequestSchema.parse(body);

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
      return new Response(
        JSON.stringify({ error: "User not found in member system" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create match request
    const matchRequest: MatchRequest = {
      id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      discordUserId,
      location,
      status: "open",
      createdAt: new Date(),
      channelId,
    };

    // For now, we'll just return the match request
    // In the future, this could be stored in a database table
    console.log("Created match request:", matchRequest);

    return new Response(JSON.stringify(matchRequest), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating match request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create match request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
