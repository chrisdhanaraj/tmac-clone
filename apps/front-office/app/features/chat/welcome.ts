import prisma from "../../config/prisma.js";
import {
  WelcomeRequestPayloadSchema,
  WelcomeResponseSchema,
} from "@tmac/shared/contracts/chat";
import { logger } from "@tmac/shared/logger";

export async function generateWelcomeMessage(request: Request) {
  try {
    const body = await request.json();
    const { discordUserId } = WelcomeRequestPayloadSchema.parse(body);

    // Try to find user by Discord ID
    const user = await prisma.user.findFirst({
      where: {
        discordId: discordUserId,
      },
      select: {
        firstName: true,
        tennisProfile: true,
      },
    });

    let message: string;

    if (user && user.tennisProfile) {
      const profile = user.tennisProfile;
      const ranking = profile.tennisRanking
        ? profile.tennisRanking.replace("_", ".")
        : "Unknown";
      message =
        `Welcome to Mission Athletic Club, ${user.firstName || "Player"}! 🎾\n\n` +
        `I see you're already in our system with a ${ranking} tennis ranking. ` +
        `Feel free to use the \`/match request\` command to find players to play with!`;
    } else if (user) {
      message =
        `Welcome back, Player! 🎾\n\n` +
        `You're registered in our system but don't have a tennis profile yet. ` +
        `Please contact an administrator to complete your tennis profile setup.`;
    } else {
      message =
        `Welcome to Mission Athletic Club! 🎾\n\n` +
        `I don't see you in our member system yet. Please contact an administrator to get set up with your tennis profile and member access.`;
    }

    const responseBody = WelcomeResponseSchema.parse({ message });

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error(error, "Error generating welcome message");
    return new Response(
      JSON.stringify({ error: "Failed to generate welcome message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
