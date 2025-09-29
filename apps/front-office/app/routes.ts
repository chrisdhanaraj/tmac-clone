import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("features/auth/routes/login.tsx"),
  route("dashboard", "features/dashboard/layout.tsx", [
    index("features/dashboard/dashboard.tsx"),
    route("users", "features/user-management/routes/users.tsx"),
  ]),
  route("user", "features/user/user.tsx"),
  route("api/auth/*", "features/auth/routes/auth.ts"),
  route("api/chat/welcome", "features/chat/routes/welcome.ts"),
  route("api/chat/match-request", "features/chat/routes/match-request.ts"),
  route("api/users/approve", "features/user-management/api/approve.ts"),
  route("api/users/:userId", "features/user-management/api/get-user.ts"),
  route("api/users", "features/user-management/api/index.ts"),
  route("api/admin/assign-roles", "api/admin/assign-roles.ts"),
  route("api/intake/submit", "features/intake/api/submit.ts"),
] satisfies RouteConfig;
