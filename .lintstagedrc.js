module.exports = {
  "apps/front-office/**/*.{ts,tsx}": [
    "pnpm --filter front-office lint",
    "pnpm --filter front-office format",
  ],
  "apps/discord-bot/**/*.ts": [
    "pnpm --filter discord-bot lint",
    "pnpm --filter discord-bot format",
  ],
};
