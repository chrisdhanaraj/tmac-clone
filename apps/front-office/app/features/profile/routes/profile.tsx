import { data, redirect } from "react-router";
import { useLoaderData } from "react-router";
import { auth } from "~/features/auth/api/auth.server";
import { tennisProfileService } from "~/features/profile/api/tennis-profile.server";
import { TennisProfileForm } from "~/features/profile/components/tennis-profile-form";

// Loader function to fetch user's tennis profile data
export async function loader({ request }: { request: Request }) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect("/");
  }

  try {
    // Fetch user's tennis profile
    const tennisProfile = await tennisProfileService.getTennisProfile(
      session.user.id
    );

    // Get profile completion status
    const completionStatus =
      await tennisProfileService.getProfileCompletionStatus(session.user.id);

    return data({
      user: session.user,
      tennisProfile,
      completionStatus,
    });
  } catch (error) {
    console.error("Error loading tennis profile:", error);
    throw new Response("Failed to load tennis profile", { status: 500 });
  }
}

// Action function to handle tennis profile updates
export async function action({ request }: { request: Request }) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect("/");
  }

  try {
    const formData = await request.json();

    // Update the tennis profile
    const updatedProfile = await tennisProfileService.updateTennisProfile(
      session.user.id,
      formData
    );

    // Get updated completion status
    const completionStatus =
      await tennisProfileService.getProfileCompletionStatus(session.user.id);

    return data({
      success: true,
      profile: updatedProfile,
      completionStatus,
    });
  } catch (error) {
    console.error("Error updating tennis profile:", error);
    return data(
      {
        success: false,
        error: "Failed to update tennis profile",
      },
      { status: 500 }
    );
  }
}

// Main profile component
export default function ProfileRoute() {
  const { user, tennisProfile, completionStatus } =
    useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b pb-6">
          <h1 className="text-3xl font-bold">Tennis Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your tennis information and preferences
          </p>

          {/* Profile completion indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Profile Completion</span>
              <span>{completionStatus.completionPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-1">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionStatus.completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completionStatus.completedFields} of{" "}
              {completionStatus.totalFields} fields completed
            </p>
          </div>
        </div>

        {/* Tennis Profile Form */}
        <TennisProfileForm
          profile={tennisProfile}
          completionStatus={completionStatus}
        />
      </div>
    </div>
  );
}
