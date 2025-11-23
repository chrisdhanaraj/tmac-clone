import type { Route } from "./+types/verify";
import prisma from "~/config/prisma.js";
import { logger } from "@tmac/shared/logger";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_WEBHOOK_SECRET = process.env.DISCORD_WEBHOOK_SECRET;

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { email, discordId } = await request.json();

    if (!email || !discordId) {
      return Response.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Email not found in our system",
        },
        { status: 404 }
      );
    }

    // Check if user is approved
    if (!user.approved) {
      return Response.json(
        {
          success: false,
          message:
            "Your membership hasn't been approved yet. Please wait for admin approval.",
        },
        { status: 403 }
      );
    }

    // Update user with Discord ID
    await prisma.user.update({
      where: { id: user.id },
      data: { discordId },
    });

    // Send webhook to Discord bot to add role
    try {
      const webhookResponse = await fetch(
        `${DISCORD_WEBHOOK_URL}/webhook/verify-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DISCORD_WEBHOOK_SECRET}`,
          },
          body: JSON.stringify({
            discordId,
            email: user.email,
          }),
        }
      );

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        logger.error({ errorText }, "Failed to send webhook to Discord bot");
        // Don't fail the verification if webhook fails
      }
    } catch (webhookError) {
      logger.error(webhookError, "Error sending webhook to Discord bot");
      // Don't fail the verification if webhook fails
    }

    return Response.json({
      success: true,
      message: "Successfully verified",
    });
  } catch (error) {
    logger.error(error, "Error during verification");
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
