import { Client, GuildMember, Message, EmbedBuilder } from "discord.js";
import { LoopsClient } from "loops";
import { env } from "../env.js";
import { logger } from "@tmac/shared/logger";

const loopsClient = new LoopsClient(env.loopsApiKey);

// Store pending verification states
const pendingVerifications = new Map<
  string,
  { userId: string; guildId: string; awaitingEmail: boolean }
>();

export function addPendingVerification(userId: string, guildId: string) {
  pendingVerifications.set(userId, {
    userId,
    guildId,
    awaitingEmail: true,
  });
}

export async function handleMemberJoin(member: GuildMember) {
  try {
    // Check if member is a bot
    if (member.user.bot) return;

    logger.info(`New member joined: ${member.user.tag} (${member.id})`);

    // Send welcome DM
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Welcome to the TMAC Community!")
      .setDescription(
        "To verify your membership, please reply with your email address.\n\n" +
          "We'll send you a verification link to confirm your membership status.",
      )
      .setFooter({ text: "Please reply with your email address" });

    try {
      const dmChannel = await member.user.createDM();
      await dmChannel.send({ embeds: [embed] });

      // Mark as awaiting email
      addPendingVerification(member.user.id, member.guild.id);

      logger.info(`Sent verification DM to ${member.user.tag}`);
    } catch (error) {
      logger.error(error, `Failed to send DM to ${member.user.tag}`);
      // User might have DMs disabled
    }
  } catch (error) {
    logger.error(error, "Error handling member join");
  }
}

export async function handleDirectMessage(message: Message, _client: Client) {
  // Ignore bot messages
  if (message.author.bot) return;

  // Only process DMs
  if (message.channel.type !== 1) return; // 1 is DM channel type

  const verification = pendingVerifications.get(message.author.id);

  if (!verification || !verification.awaitingEmail) {
    return;
  }

  // Basic email validation
  const email = message.content.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    await message.reply(
      "That doesn't look like a valid email address. Please try again.",
    );
    return;
  }

  try {
    // Send verification email via Loops
    const verificationUrl = `${
      env.frontOfficeUrl
    }/verify-discord?email=${encodeURIComponent(email)}&discordId=${
      verification.userId
    }`;

    await loopsClient.sendTransactionalEmail({
      transactionalId: env.loopsTransactionalEmailTemplateId,
      email: email,
      dataVariables: {
        verificationUrl: verificationUrl,
        discordUsername: message.author.tag,
      },
    });

    // Send confirmation
    const successEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("Verification Email Sent!")
      .setDescription(
        `We've sent a verification link to **${email}**\n\n` +
          "Please check your email and click the verification button to complete your membership verification.",
      );

    await message.reply({ embeds: [successEmbed] });

    // Remove from pending
    pendingVerifications.delete(message.author.id);

    logger.info(
      `Sent verification email to ${email} for user ${message.author.tag}`,
    );
  } catch (error) {
    logger.error(error, "Error sending verification email");
    await message.reply(
      "Sorry, there was an error processing your request. Please try again or contact an administrator.",
    );
  }
}

export async function handleVerificationComplete(
  discordId: string,
  client: Client,
) {
  try {
    // Find the guild and member
    const guild = client.guilds.cache.get(env.guildId);
    if (!guild) {
      logger.error("Guild not found");
      return;
    }

    const member = await guild.members.fetch(discordId);
    if (!member) {
      logger.error("Member not found");
      return;
    }

    // Find or create the "Community Member" role
    let role = guild.roles.cache.find((r) => r.name === "Community Member");

    if (!role) {
      role = await guild.roles.create({
        name: "Community Member",
        color: 0x00ff00,
        reason: "Auto-created for verified members",
      });
      logger.info("Created 'Community Member' role");
    }

    // Add role to member
    await member.roles.add(role);

    // Send success DM
    const successEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("Verification Complete!")
      .setDescription(
        "Your membership has been verified! You now have access to the community.",
      );

    try {
      const dmChannel = await member.user.createDM();
      await dmChannel.send({ embeds: [successEmbed] });
    } catch (error) {
      logger.error(error, `Failed to send success DM to ${member.user.tag}`);
    }

    logger.info(
      `Successfully verified and added Community Member role to ${member.user.tag}`,
    );
  } catch (error) {
    logger.error(error, "Error completing verification");
  }
}
