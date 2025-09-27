import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("features/home/home.tsx"),
  route("api/auth/*", "features/auth/routes/auth.ts"),
] satisfies RouteConfig;
