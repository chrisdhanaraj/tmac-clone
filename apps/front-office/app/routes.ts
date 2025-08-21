import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("features/auth/routes/login.tsx"),
  route("api/auth/*", "features/auth/routes/auth.ts"),
  route("signup", "features/auth/routes/signup.tsx"),
  route("dashboard", "features/dashboard/routes/dashboard.tsx", [
    index("features/dashboard/routes/home.tsx"),
    route("events", "features/events/routes/events/events.tsx"),
    route("events/create", "features/events/routes/events/create-events.tsx"),
    route("events/:id/edit", "features/events/routes/events/edit-events.tsx"),
    route("courts", "features/courts/routes/courts.tsx"),
    route("profile", "features/profile/routes/profile/route.tsx"),
    route("roster", "features/roster/routes/roster.tsx"),
  ]),
] satisfies RouteConfig;
