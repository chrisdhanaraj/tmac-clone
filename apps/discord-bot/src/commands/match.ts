import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { env } from "../env.js";
import {
  MatchRequestResponseSchema,
  type MatchRequestPayload,
} from "@tmac/shared/contracts/chat";
import { logger } from "@tmac/shared/logger";

export const data = new SlashCommandBuilder()
  .setName("match")
  .setDescription("Create a new match request")
  .addStringOption((option) =>
    option
      .setName("location")
      .setDescription("Where you want to play")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const location = interaction.options.getString("location", true);

  await interaction.deferReply();

  try {
    const payload: MatchRequestPayload = {
      discordUserId: interaction.user.id,
      location,
      channelId: interaction.channelId,
    };

    const url = `${env.frontOfficeUrl}/api/chat/match-request`;
    logger.info({ url, payload }, "Making match request");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    logger.info(
      {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      },
      "Match request response"
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ errorText }, "Error response body");
      throw new Error(
        `Front-office API error: ${response.status} - ${errorText}`
      );
    }

    const matchRequest = MatchRequestResponseSchema.parse(
      await response.json()
    );
    const playerId = interaction.user.id;

    const message =
      `🎾 **Match Request**\n\n` +
      `**Player:** <@${playerId}>\n` +
      `**Location:** ${matchRequest.location}\n` +
      `**Status:** ${matchRequest.status}\n\n` +
      `React with 🎾 to join this match!`;

    await interaction.editReply({ content: message });
  } catch (error) {
    logger.error(error, "Error creating match request");
    await interaction.editReply({
      content: "Sorry, I encountered an error creating your match request.",
    });
  }
}
