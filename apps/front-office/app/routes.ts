import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("api/auth/*", "features/auth/routes/auth.ts"),
] satisfies RouteConfig;
