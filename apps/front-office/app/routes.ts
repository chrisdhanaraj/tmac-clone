import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("features/auth/routes/login.tsx"),
  route("dashboard", "features/dashboard/layout.tsx", [
    index("features/dashboard/dashboard.tsx"),
    route("users", "features/user-management/routes/users.tsx"),
  ]),
  route("user", "features/user/user.tsx"),
  route(
    "verify-discord",
    "features/discord-verification/routes/verify-discord.tsx"
  ),
  route("api/auth/*", "features/auth/routes/auth.ts"),
  route("api/discord/welcome", "features/discord/routes/welcome.ts"),
  route(
    "api/discord/match-request",
    "features/discord/routes/match-request.ts"
  ),
  route("api/discord/ranking", "features/discord/routes/update-ranking.ts"),
  route("api/users/approve", "features/user-management/api/approve.ts"),
  route("api/users/:userId", "features/user-management/api/get-user.ts"),
  route("api/users", "features/user-management/api/index.ts"),
  route("api/admin/assign-roles", "api/admin/assign-roles.ts"),
  route("api/discord/verify", "features/discord-verification/api/verify.ts"),
  // Cron callers must include `x-sync-secret: <SYNC_SECRET>`
  route("api/sheets-to-db-sync", "features/sync/route.ts"),
] satisfies RouteConfig;
