# TMAC Platform

Tennis club management platform built with pnpm workspaces.

## Package Manager

**⚠️ This project uses pnpm workspaces. Always use `pnpm` commands, not `npm`.**

```bash
# Install dependencies
pnpm install

# Run commands in workspaces
pnpm --filter front-office dev
pnpm --filter front-office test:run
```

## Apps

- **Front Office** (webapp) - Tennis club management application
- **Chat Listener** - Discord bot integration
