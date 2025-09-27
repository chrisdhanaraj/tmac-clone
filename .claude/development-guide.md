# Development Guide

## Quick Start Checklist

1. **Database Setup**
   ```bash
   docker run --name tennis-club-db \
     -e POSTGRES_DB=tennis_club \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 -d postgres:15
   ```

2. **Environment Files**
   - Copy `apps/front-office/.env.example` to `apps/front-office/.env`
   - Copy `apps/chat-listener/.env.example` to `apps/chat-listener/.env`
   - Set `DATABASE_URL`, `DISCORD_TOKEN`, `BETTER_AUTH_SECRET`

3. **Install & Run**
   ```bash
   pnpm install                           # Root dependencies
   cd apps/front-office && pnpm db:migrate  # Setup database
   pnpm dev                              # Start front-office
   # In new terminal:
   cd apps/chat-listener && pnpm dev    # Start Discord bot
   ```

## Common Development Tasks

### Adding New Discord Commands
1. Create handler in `apps/chat-listener/src/commands/`
2. Import and register in `apps/chat-listener/src/index.ts`
3. Add corresponding API endpoint in `apps/front-office/app/features/chat/`
4. Update routes in `apps/front-office/app/routes.ts`

### Database Changes
1. Modify `apps/front-office/prisma/schema.prisma`
2. Run `pnpm db:migrate` to create migration
3. Run `pnpm db:generate` to update Prisma client
4. Update TypeScript code as needed

### Testing Discord Integration
- Use Discord's developer portal to test slash commands
- Bot is registered to "Mission Athletic Club" server
- Use `/internal_welcome_message` and `/match request` for testing

## File Conventions

### Front-Office
- Features organized by domain: `app/features/{auth,chat}/`
- Route handlers: `app/features/{domain}/routes/`
- Business logic: `app/features/{domain}/{feature}.ts`
- Database access via `app/lib/prisma.ts`

### Chat-Listener
- Command handlers: `src/commands/{command}.ts`
- Configuration: `src/config.ts`
- Main bot logic: `src/index.ts`

## Useful Scripts

```bash
# Front-office
pnpm dev              # Development server
pnpm db:studio        # Database GUI
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed test data
pnpm typecheck        # Check TypeScript

# Chat-listener
pnpm dev              # Development with auto-reload
pnpm start            # Production mode
pnpm typecheck        # Check TypeScript
```