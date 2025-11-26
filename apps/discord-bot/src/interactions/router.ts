import {
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
} from "discord.js";
import type { Interaction } from "discord.js";
import { logger } from "@tmac/shared/logger";
import { env } from "../env.js";

// Command Imports
import {
  data as matchData,
  execute as matchExecute,
  handleModal as matchModal,
} from "../commands/match.js";
import { data as rankData, execute as rankExecute } from "../commands/rank.js";

// Interaction Imports
import { handleJoinMatch, handleScheduleMatch } from "./buttons.js";

// Types
type ChatInputCommandHandler = (
  interaction: ChatInputCommandInteraction
) => Promise<void>;

type ModalSubmitHandler = (
  interaction: ModalSubmitInteraction
) => Promise<void>;

// Registries
const commands = new Map<string, ChatInputCommandHandler>([
  [matchData.name, matchExecute],
  [rankData.name, rankExecute],
]);

const modals = new Map<string, ModalSubmitHandler>([
  ["match_request_modal", matchModal],
]);

export async function handleInteraction(interaction: Interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModal(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction);
    }
  } catch (error) {
    logger.error(error, "Error handling interaction");
    // Attempt to reply if possible
    if (
      interaction.isRepliable() &&
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction.reply({
        content: "Something went wrong processing your request.",
        ephemeral: true,
      });
    }
  }
}

async function handleCommand(interaction: ChatInputCommandInteraction) {
  const handler = commands.get(interaction.commandName);
  if (!handler) return;

  try {
    await handler(interaction);
  } catch (error) {
    logger.error(error, `Failed to execute /${interaction.commandName}`);
    throw error; // Re-throw to be caught by top-level handler
  }
}

async function handleModal(interaction: ModalSubmitInteraction) {
  const handler = modals.get(interaction.customId);
  if (!handler) return;

  try {
    await handler(interaction);
  } catch (error) {
    logger.error(error, `Failed to execute modal ${interaction.customId}`);
    throw error;
  }
}

async function handleButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  if (customId.startsWith("join_match_")) {
    const matchId = customId.replace("join_match_", "");
    await handleJoinMatch(interaction, matchId);
  } else if (customId.startsWith("schedule_match_")) {
    // Format: schedule_match_{creatorId}_{matchId}
    const parts = customId.split("_");
    // parts[0] = schedule, parts[1] = match
    const creatorId = parts[2];
    const matchId = parts.slice(3).join("_"); // Re-join in case matchId contains underscores (though ours don't currently)

    if (!creatorId) {
      logger.error(`Invalid schedule match customId: ${customId}`);
      await interaction.reply({
        content: "Something went wrong processing this button.",
        ephemeral: true,
      });
      return;
    }

    await handleScheduleMatch(interaction, creatorId, matchId);
  }
}

async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  if (interaction.customId === "rank_selection") {
    await interaction.deferReply({ ephemeral: true });

    try {
      const ranking = interaction.values[0];
      const discordUserId = interaction.user.id;

      const response = await fetch(
        `${env.frontOfficeUrl}/api/discord/ranking`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            discordUserId,
            ranking,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      await interaction.editReply({
        content: `Successfully updated your tennis ranking to **${interaction.component.options.find(o => o.value === ranking)?.label}**!`,
      });
    } catch (error) {
      logger.error(error, "Error updating ranking");
      await interaction.editReply({
        content: "Failed to update your ranking. Please try again later.",
      });
    }
  }
}
