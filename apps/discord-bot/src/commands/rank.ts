import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("rank")
  .setDescription("Update your tennis ranking")
  .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild])
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ]);

export async function execute(interaction: ChatInputCommandInteraction) {
  const select = new StringSelectMenuBuilder()
    .setCustomId("rank_selection")
    .setPlaceholder("Select your tennis ranking")
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel("1.0").setValue("ONE_ZERO"),
      new StringSelectMenuOptionBuilder().setLabel("1.5").setValue("ONE_FIVE"),
      new StringSelectMenuOptionBuilder().setLabel("2.0").setValue("TWO_ZERO"),
      new StringSelectMenuOptionBuilder().setLabel("2.5").setValue("TWO_FIVE"),
      new StringSelectMenuOptionBuilder()
        .setLabel("2.75")
        .setValue("TWO_SEVEN_FIVE"),
      new StringSelectMenuOptionBuilder()
        .setLabel("3.0")
        .setValue("THREE_ZERO"),
      new StringSelectMenuOptionBuilder()
        .setLabel("3.25")
        .setValue("THREE_TWO_FIVE"),
      new StringSelectMenuOptionBuilder()
        .setLabel("3.5")
        .setValue("THREE_FIVE"),
      new StringSelectMenuOptionBuilder()
        .setLabel("3.75")
        .setValue("THREE_SEVEN_FIVE"),
      new StringSelectMenuOptionBuilder().setLabel("4.0").setValue("FOUR_ZERO"),
      new StringSelectMenuOptionBuilder()
        .setLabel("4.25")
        .setValue("FOUR_TWO_FIVE"),
      new StringSelectMenuOptionBuilder().setLabel("4.5").setValue("FOUR_FIVE"),
      new StringSelectMenuOptionBuilder()
        .setLabel("4.75")
        .setValue("FOUR_SEVEN_FIVE"),
      new StringSelectMenuOptionBuilder().setLabel("5.0").setValue("FIVE_ZERO"),
      new StringSelectMenuOptionBuilder().setLabel("5.5").setValue("FIVE_FIVE"),
      new StringSelectMenuOptionBuilder().setLabel("6.0").setValue("SIX_ZERO"),
      new StringSelectMenuOptionBuilder().setLabel("6.5").setValue("SIX_FIVE"),
      new StringSelectMenuOptionBuilder().setLabel("7.0").setValue("SEVEN_ZERO")
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    select
  );

  await interaction.reply({
    content: "Choose your current tennis ranking:",
    components: [row],
    ephemeral: true,
  });
}
