# Discord Bot

This service powers the Discord integration for TMAC, handling member verification, match coordination, and community engagement.

## Local Development Setup

To work on the bot locally without interfering with production, you need to set up a separate "Dev" Discord Application.

### 1. Create a Test Discord Server

1. [Go to the [Discord Developer Portal](https://discord.com/developers/applications).](https://support.discord.com/hc/en-us/articles/204849977-How-do-I-create-a-server).
2. Click **Create My Own** and name it something like `TMAC Bot Test Server`.

### 2. Create a Dev Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** and name it something like `TMAC Bot (Dev)`.
3. Go to the **Bot** tab:
   - Click **Reset Token** to get your `DISCORD_TOKEN`.
   - Disable "Public Bot" (optional, but recommended for dev).
   - Enable **Privileged Gateway Intents**:
     - Presence Intent
     - Server Members Intent
     - Message Content Intent
4. Go to the **OAuth2** tab -> **URL Generator**:
   - Scopes: `bot`, `applications.commands`.
   - Bot Permissions: `Administrator` (for easiest dev setup) or select specific permissions:
     - Manage Roles
     - Manage Channels
     - Send Messages
     - Manage Messages
     - Embed Links
     - Attach Files
   - Copy the generated URL and open it in your browser to invite the bot to your test server.

### 3. Environment Configuration

Create a `.env` file in `apps/discord-bot/` based on the required variables:

```bash
# apps/discord-bot/.env

# From Developer Portal -> Bot tab
DISCORD_TOKEN="your_dev_bot_token"

# From Developer Portal -> General Information tab
DISCORD_APPLICATION_ID="your_dev_app_id"

# Right-click your test server in Discord -> Copy Server ID (enable Developer Mode in Discord settings if you don't see this)
DISCORD_GUILD_ID="your_test_server_id"

# URL where your local front-office is running
FRONT_OFFICE_URL="http://localhost:5173"

# Shared secret between bot and front-office for webhook security
DISCORD_WEBHOOK_SECRET="dev-secret-123"

# Port for the bot's internal webhook server
PORT="3001"

# Loops API (can use same as prod or test key if available)
LOOPS_API_KEY="your_loops_key"
LOOPS_TRANSACTIONAL_EMAIL_TEMPLATE_ID="your_template_id"
```

Update your Front Office `.env` (in `apps/front-office/`) to point to your local bot:

```bash
# apps/front-office/.env

# URL of the local bot's webhook server
DISCORD_WEBHOOK_URL="http://localhost:3001"

# Must match the secret in the bot's .env
DISCORD_WEBHOOK_SECRET="dev-secret-123"
```

### 4. Running Locally

1. **Install dependencies**:

   ```bash
   pnpm install
   ```
   
2. **Start Front Office**:
   In a separate terminal tab:
   ```bash
   cd apps/front-office
   pnpm dev
   ```
   
3. **Start the Bot**:

```bash
cd apps/discord-bot
pnpm dev
```
   
4. **Register Slash Commands**:
   In a separate terminal tab, make sure you're in `apps/discord-bot` and register the commands (like `/verify`) with your dev guild.

   ```bash
   cd apps/discord-bot
   pnpm register:commands
   ```

### 4. Testing the Flow

1. **Verification**:
   - In your test Discord server, use the command `/match`.
   - The bot should open a modal with a title **Request a Match**.

## Deployment

The production bot is deployed separately. Ensure environment variables in the deployment environment match the production Discord Application credentials.
