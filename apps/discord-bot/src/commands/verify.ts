import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import {
  addPendingVerification,
  isPendingVerification,
} from "../flows/member-verification.js";
import { logger } from "@tmac/shared/logger";

export const data = new SlashCommandBuilder()
  .setName("verify")
  .setDescription("Start the Discord verification process");

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    // Check if already verified (has Community Member role)
    if (interaction.member && interaction.guild) {
      const member =
        interaction.member instanceof GuildMember
          ? interaction.member
          : await interaction.guild.members.fetch(interaction.user.id);

      const hasRole = member.roles.cache.some(
        (r) => r.name === "Community Member",
      );

      if (hasRole) {
        await interaction.reply({
          content: "You are already a verified Community Member!",
          ephemeral: true,
        });
        return;
      }
    }

    // Check if already pending
    if (isPendingVerification(interaction.user.id)) {
      await interaction.reply({
        content:
          "You already have a verification in progress. Please check your DMs for instructions, or reply to the DM with your email.",
        ephemeral: true,
      });
      return;
    }

    // Send a DM to the user
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Welcome to the TMAC Community!")
      .setDescription(
        "To verify your membership, please reply with your email address.\n\n" +
          "We'll send you a verification link to confirm your membership status.",
      )
      .setFooter({ text: "Please reply with your email address" });

    try {
      const dmChannel = await interaction.user.createDM();
      await dmChannel.send({ embeds: [embed] });

      // Mark as awaiting email
      addPendingVerification(interaction.user.id, interaction.guildId || "");

      // Respond to the interaction
      await interaction.reply({
        content: "I've sent you a DM! Please check your direct messages.",
        ephemeral: true,
      });

      logger.info(
        `Verification flow started for ${interaction.user.tag} (${interaction.user.id})`,
      );
    } catch (error) {
      logger.error(error, `Failed to send DM to ${interaction.user.tag}`);
      await interaction.reply({
        content:
          "I couldn't send you a DM. Please enable direct messages from server members in your privacy settings and try again.",
        ephemeral: true,
      });
    }
  } catch (error) {
    logger.error(error, "Error in verify command");
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "An error occurred while starting the verification process.",
        ephemeral: true,
      });
    }
  }
}
