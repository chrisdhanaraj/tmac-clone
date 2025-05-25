import type { Route } from "./+types/dashboard";
import { data, Outlet, redirect } from "react-router";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { useState, useEffect } from "react";
import { AppSidebar } from "../components/AppSidebar";
import { auth } from "~/features/auth/api/auth.server";
import { tennisProfileService } from "~/features/profile/api/tennis-profile.server";
import { ProfileCompletionModal } from "~/features/profile/components/profile-completion-modal";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    // User is not authenticated, redirect to login
    throw redirect("/");
  }

  // Check if user should see profile completion reminder
  const shouldShowReminder =
    await tennisProfileService.shouldShowProfileReminder(session.user.id);
  const completionStatus =
    await tennisProfileService.getProfileCompletionStatus(session.user.id);

  // Return the session data and onboarding info
  return data({
    session,
    shouldShowReminder,
    completionStatus,
  });
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect("/");
  }

  try {
    const body = await request.json();

    if (body.action === "skipReminder") {
      await tennisProfileService.updateReminderTimestamp(session.user.id);
      return data({ success: true });
    }

    return data({ success: false, error: "Unknown action" });
  } catch (error) {
    console.error("Error in dashboard action:", error);
    return data({ success: false, error: "Failed to process request" });
  }
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { session, shouldShowReminder, completionStatus } = loaderData;
  const [showModal, setShowModal] = useState(shouldShowReminder);

  const handleSkipReminder = async () => {
    try {
      // Update reminder timestamp via fetch to the current route
      await fetch(window.location.pathname, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "skipReminder" }),
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error skipping reminder:", error);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </SidebarInset>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSkip={handleSkipReminder}
        completionStatus={completionStatus}
        userName={session.user.firstName || session.user.name}
      />
    </SidebarProvider>
  );
}
