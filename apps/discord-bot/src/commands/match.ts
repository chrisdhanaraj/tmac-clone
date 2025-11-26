import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

import { env } from "../env.js";
import {
  MatchRequestResponseSchema,
  type MatchRequestPayload,
} from "@tmac/shared/contracts/chat";
import { logger } from "@tmac/shared/logger";

export const data = new SlashCommandBuilder()
  .setName("match")
  .setDescription("Create a new match request");

export async function execute(interaction: ChatInputCommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("match_request_modal")
    .setTitle("Request a Match");

  const dateInput = new TextInputBuilder()
    .setCustomId("date")
    .setLabel("Date")
    .setPlaceholder("e.g. Sunday, 10/15")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const timeInput = new TextInputBuilder()
    .setCustomId("time")
    .setLabel("Time")
    .setPlaceholder("e.g. 3:00-4:30pm")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const courtInput = new TextInputBuilder()
    .setCustomId("court")
    .setLabel("Court Location")
    .setPlaceholder("e.g. DuPont")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const levelInput = new TextInputBuilder()
    .setCustomId("level")
    .setLabel("Target Level")
    .setPlaceholder("e.g. 3.5-4.0")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const notesInput = new TextInputBuilder()
    .setCustomId("notes")
    .setLabel("Notes (Optional)")
    .setPlaceholder("Any additional info...")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    dateInput
  );
  const secondActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(timeInput);
  const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    courtInput
  );
  const fourthActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(levelInput);
  const fifthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    notesInput
  );

  modal.addComponents(
    firstActionRow,
    secondActionRow,
    thirdActionRow,
    fourthActionRow,
    fifthActionRow
  );

  await interaction.showModal(modal);
}

export async function handleModal(interaction: ModalSubmitInteraction) {
  const date = interaction.fields.getTextInputValue("date");
  const time = interaction.fields.getTextInputValue("time");
  const court = interaction.fields.getTextInputValue("court");
  const level = interaction.fields.getTextInputValue("level");
  const notes = interaction.fields.getTextInputValue("notes");

  await interaction.deferReply();

  try {
    const payload: MatchRequestPayload = {
      discordUserId: interaction.user.id,
      date,
      time,
      court,
      level,
      notes: notes || undefined,
      channelId: interaction.channelId || undefined,
      // matchType is optional in payload, defaulting to undefined
      matchType: undefined,
    };

    const url = `${env.frontOfficeUrl}/api/discord/match-request`;
    logger.info({ url, payload }, "Making match request");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

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

    // Format message with emojis
    const message =
      `🗓️ ${matchRequest.date}\n` +
      `⏰ ${matchRequest.time}\n` +
      `📍 ${matchRequest.court}\n` +
      `🎾 ${matchRequest.level}\n` +
      (matchRequest.playerRating ? `🤚 ${matchRequest.playerRating}\n` : "") +
      (matchRequest.notes ? `📝 ${matchRequest.notes}\n` : "") +
      `\n**Player:** <@${playerId}>`;

    const joinButton = new ButtonBuilder()
      .setCustomId(`join_match_${matchRequest.id}`)
      .setLabel("Join")
      .setStyle(ButtonStyle.Primary);

    const scheduleButton = new ButtonBuilder()
      .setCustomId(`schedule_match_${playerId}_${matchRequest.id}`)
      .setLabel("Mark Scheduled")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      joinButton,
      scheduleButton
    );

    await interaction.editReply({ content: message, components: [row] });
  } catch (error) {
    logger.error(error, "Error creating match request");
    await interaction.editReply({
      content: "Sorry, I encountered an error creating your match request.",
    });
  }
}
