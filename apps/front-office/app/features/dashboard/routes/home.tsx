import { SidebarTrigger } from "~/components/ui/sidebar";
import type { Route } from "./+types/home";
import type { Route as DashboardRoute } from "./+types/dashboard";
import { Separator } from "~/components/ui/separator";
import { useMatches, useRouteLoaderData } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Home" }, { name: "description", content: "Home" }];
}

export default function Events({ loaderData }: Route.ComponentProps) {
  const dashboardData = useRouteLoaderData(
    "features/dashboard/routes/dashboard"
  );

  if (!dashboardData) {
    // This shouldn't happen due to the redirect in the dashboard loader, but TypeScript doesn't know that
    return null;
  }

  const { session } = dashboardData;

  return (
    <div>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Home</h1>
        </div>
      </header>
      <div className="p-4">
        <div>Hello, {session.user.firstName}</div>
      </div>
    </div>
  );
}
