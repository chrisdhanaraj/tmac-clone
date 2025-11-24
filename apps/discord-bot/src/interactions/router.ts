import {
  ChatInputCommandInteraction,
  Interaction,
  ModalSubmitInteraction,
  ButtonInteraction,
} from "discord.js";
import { logger } from "@tmac/shared/logger";

// Command Imports
import { data as pingData, execute as pingExecute } from "../commands/ping.js";
import {
  data as matchData,
  execute as matchExecute,
  handleModal as matchModal,
} from "../commands/match.js";
import {
  data as welcomeData,
  execute as welcomeExecute,
} from "../commands/welcome.js";
import {
  data as verifyData,
  execute as verifyExecute,
} from "../commands/verify.js";

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
  [pingData.name, pingExecute],
  [matchData.name, matchExecute],
  [welcomeData.name, welcomeExecute],
  [verifyData.name, verifyExecute],
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
    
    await handleScheduleMatch(interaction, creatorId, matchId);
  }
}

