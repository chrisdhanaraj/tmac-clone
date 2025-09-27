import { z } from 'zod';
import prisma from '../../config/prisma.js';

const WelcomeRequestSchema = z.object({
  discordUserId: z.string(),
});

export async function generateWelcomeMessage(request: Request) {
  try {
    const body = await request.json();
    const { discordUserId } = WelcomeRequestSchema.parse(body);

    // Try to find user by Discord ID
    const user = await prisma.user.findFirst({
      where: {
        discordId: discordUserId,
      },
      include: {
        tennisProfile: true,
      },
    });

    let message: string;

    if (user && user.tennisProfile) {
      const profile = user.tennisProfile;
      const ranking = profile.tennisRanking ? profile.tennisRanking.replace('_', '.') : 'Unknown';
      message = `Welcome to Mission Athletic Club, ${user.name || 'Player'}! 🎾\n\n` +
        `I see you're already in our system with a ${ranking} tennis ranking. ` +
        `Feel free to use the \`/match request\` command to find players to play with!`;
    } else if (user) {
      message = `Welcome back, ${user.name || 'Player'}! 🎾\n\n` +
        `You're registered in our system but don't have a tennis profile yet. ` +
        `Please contact an administrator to complete your tennis profile setup.`;
    } else {
      message = `Welcome to Mission Athletic Club! 🎾\n\n` +
        `I don't see you in our member system yet. Please contact an administrator to get set up with your tennis profile and member access.`;
    }

    return new Response(JSON.stringify({ message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating welcome message:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate welcome message' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}