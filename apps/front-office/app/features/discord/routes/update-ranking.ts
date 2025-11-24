import prisma from "../../../config/prisma";
import { logger } from "@tmac/shared/logger";
import { TennisRanking } from "../../../generated/prisma/enums";
import { z } from "zod";

const UpdateRankingSchema = z.object({
  discordUserId: z.string(),
  ranking: z.nativeEnum(TennisRanking),
});

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const result = UpdateRankingSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: "Invalid payload", details: result.error }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { discordUserId, ranking } = result.data;

    // Find user by Discord ID
    const user = await prisma.user.findFirst({
      where: {
        discordId: discordUserId,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update or create tennis profile
    await prisma.tennisProfile.upsert({
      where: {
        userId: user.id,
      },
      update: {
        tennisRanking: ranking,
      },
      create: {
        userId: user.id,
        tennisRanking: ranking,
      },
    });

    logger.info({ discordUserId, ranking }, "Updated user ranking via Discord");

    return new Response(JSON.stringify({ success: true, ranking }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error(error, "Error updating ranking");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
