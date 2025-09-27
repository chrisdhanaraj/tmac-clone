import { useLoaderData, redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { auth } from "../auth/api/auth.server";

// Loader: Verify authentication and load user data
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    throw redirect("/login");
  }

  return {
    user: session.user,
    session: session.session,
  };
}

// Action: Handle logout
export async function action({ request }: { request: Request }) {
  await auth.api.signOut({
    headers: request.headers,
  });
  throw redirect("/login");
}

export default function User() {
  const { user, session } = useLoaderData<typeof loader>();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user.firstName}!</CardTitle>
              <CardDescription>
                You are successfully logged in to your tennis club account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* User Information */}
                <div className="grid gap-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Account Information
                  </h3>
                  <div className="grid gap-1 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {user.firstName} {user.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {user.email}
                    </p>
                    {user.emailVerified && (
                      <p className="flex items-center gap-2 text-green-600">
                        <span className="font-medium">Email Status:</span>
                        <span>✓ Verified</span>
                        <span className="text-xs text-gray-500">
                          on {formatDate(user.emailVerified.toString())}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Session Information */}
                <div className="grid gap-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Session Information
                  </h3>
                  <div className="grid gap-1 text-sm">
                    <p>
                      <span className="font-medium">Session ID:</span>
                      <span className="font-mono text-xs ml-1">
                        {session.id.slice(0, 8)}...
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Session Expires:</span>{" "}
                      {formatDate(session.expiresAt.toString())}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account and session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Refresh Session
                </Button>
                <form method="post" className="flex-1">
                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full"
                    aria-label="Sign out of your account"
                  >
                    Sign Out
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Magic Link Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Magic Link Authentication</CardTitle>
              <CardDescription>
                You successfully authenticated using a secure email link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-green-600">
                  ✓ Passwordless authentication completed
                </p>
                <p className="text-gray-600">
                  Your account is secured with magic link authentication. No
                  password required - just check your email for secure login
                  links.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
