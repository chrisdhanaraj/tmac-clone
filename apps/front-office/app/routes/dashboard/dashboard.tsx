import type { Route } from "./+types/dashboard";
import { Outlet, redirect } from "react-router";
import { auth } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    // User is not authenticated, redirect to login
    throw redirect("/login");
  }

  // Return the session data to make it available in the component
  return { session };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Welcome to the dashboard!" },
  ];
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { session } = loaderData;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.email}!</p>
      <Outlet />
    </div>
  );
}
