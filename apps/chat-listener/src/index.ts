import { Client, Constants, CommandInteraction } from 'eris';
import { config } from './config.js';
import { handleWelcomeMessage } from './commands/welcome.js';
import { handleMatchRequest } from './commands/match.js';

const bot = new Client(config.DISCORD_TOKEN);

bot.on('ready', () => {
  console.log('Discord bot is ready!');

  const commands = [
    {
      name: 'internal_welcome_message',
      description: 'Generate a welcome message for a new user',
      options: [
        {
          name: 'target',
          description: 'The user to welcome',
          type: Constants.ApplicationCommandOptionTypes.USER,
          required: true,
        },
      ],
    },
    {
      name: 'match',
      description: 'Tennis match commands',
      options: [
        {
          name: 'request',
          description: 'Request a match at a specific location',
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          options: [
            {
              name: 'location',
              description: 'Where you want to play',
              type: Constants.ApplicationCommandOptionTypes.STRING,
              required: true,
            },
          ],
        },
      ],
    },
  ];

  // Register slash commands
  commands.forEach(command => {
    bot
      .createGuildCommand(config.GUILD_ID, {
        name: command.name,
        description: command.description,
        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: command.options as any, // Eris typing is complex, use targeted any for options
      })
      .then(() => console.log(`Registered command: ${command.name}`))
      .catch(console.error);
  });
});

bot.on('interactionCreate', async interaction => {
  if (interaction.type === Constants.InteractionTypes.APPLICATION_COMMAND) {
    const cmdInteraction = interaction as CommandInteraction;

    console.log('Received interaction:', {
      type: cmdInteraction.type,
      commandName: cmdInteraction.data?.name,
      options: cmdInteraction.data?.options,
    });

    const commandName = cmdInteraction.data.name;
    const options = cmdInteraction.data.options;

    try {
      console.log(`Processing command: ${commandName}`);

      if (commandName === 'internal_welcome_message') {
        await handleWelcomeMessage(cmdInteraction);
      } else if (commandName === 'match' && options?.[0]?.name === 'request') {
        await handleMatchRequest(cmdInteraction);
      } else {
        console.log('Unknown command or subcommand:', commandName, options);
      }
    } catch (error) {
      console.error('Error handling interaction:', error);

      const errorMessage =
        'Sorry, something went wrong processing your command.';

      if (cmdInteraction.acknowledged) {
        await cmdInteraction.editOriginalMessage({
          content: errorMessage,
        });
      } else {
        await bot.createInteractionResponse(
          cmdInteraction.id,
          cmdInteraction.token,
          {
            type: Constants.InteractionResponseTypes
              .CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: errorMessage,
              flags: Constants.MessageFlags.EPHEMERAL,
            },
          }
        );
      }
    }
  }
});

bot.on('error', (err: Error) => {
  console.error('Discord bot error:', err);
});

bot.connect();
