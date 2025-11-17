import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { env } from "../env.js";
import {
  WelcomeResponseSchema,
  type WelcomeRequestPayload,
} from "@tmac/shared/contracts/chat";
import { logger } from "@tmac/shared/logger";

export const data = new SlashCommandBuilder()
  .setName("welcome")
  .setDescription("Send a welcome message for a player")
  .addUserOption((option) =>
    option
      .setName("player")
      .setDescription("Player to welcome")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("player", true);

  await interaction.deferReply();

  try {
    logger.info(
      { user: interaction.options.getUser("player", true) },
      "Welcome command invoked"
    );
    const payload: WelcomeRequestPayload = {
      discordUserId: targetUser.id,
    };

    const response = await fetch(`${env.frontOfficeUrl}/api/chat/welcome`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Front-office API error: ${response.status}`);
    }

    const { message } = WelcomeResponseSchema.parse(await response.json());

    await interaction.editReply({ content: message });
  } catch (error) {
    logger.error(error, "Error generating welcome message");
    await interaction.editReply({
      content: "Sorry, I encountered an error generating the welcome message.",
    });
  }
}
