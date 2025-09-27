import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("features/home/home.tsx"),
  route("login", "features/auth/routes/login.tsx"),
  route("user", "features/user/user.tsx"),
  route("api/auth/*", "features/auth/routes/auth.ts"),
  route("api/chat/welcome", "features/chat/routes/welcome.ts"),
  route("api/chat/match-request", "features/chat/routes/match-request.ts"),
] satisfies RouteConfig;
