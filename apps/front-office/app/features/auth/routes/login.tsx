import { useState } from "react";
import { Form, useActionData, useNavigation, redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  MagicLinkRequestSchema,
  EmailValidationSchema,
} from "../validation/magic-link.schema";
import { auth } from "../api/auth.server";

// Loader: Redirect authenticated users to dashboard
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) {
    throw redirect("/dashboard/users");
  }
  return null;
}

// Action: Handle magic link request
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;

  try {
    // Validate email using Zod schema
    const validatedData = MagicLinkRequestSchema.parse({ email });

    // Send magic link using BetterAuth server-side API
    const result = await auth.api.signInMagicLink({
      body: {
        email: validatedData.email,
        callbackURL: validatedData.callbackURL,
      },
      headers: request.headers,
    });

    if (!result.status) {
      return {
        success: false,
        error: "Failed to send magic link",
        email,
      };
    }

    return {
      success: true,
      message: "Check your email for the login link",
      email,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        email,
      };
    }
    return {
      success: false,
      error: "Please enter a valid email address",
      email,
    };
  }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [clientError, setClientError] = useState("");
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Client-side email validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Clear previous client-side errors
    setClientError("");

    // Validate email format on change (debounced validation would be better in production)
    if (value && value.length > 0) {
      try {
        EmailValidationSchema.parse({ email: value });
      } catch {
        setClientError("Please enter a valid email address");
      }
    }
  };

  // Prevent form submission if client-side validation fails
  const handleSubmit = (e: React.FormEvent) => {
    try {
      EmailValidationSchema.parse({ email });
      setClientError("");
    } catch {
      e.preventDefault();
      setClientError("Please enter a valid email address");
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to receive a secure login link
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Display server-side error messages */}
              {actionData?.error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {actionData.error}
                </div>
              )}

              {/* Display success message */}
              {actionData?.success && (
                <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                  {actionData.message}
                </div>
              )}

              <Form method="post" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      aria-required="true"
                      aria-describedby={clientError ? "email-error" : undefined}
                      className={cn(
                        clientError && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {/* Client-side validation error */}
                    {clientError && (
                      <p
                        id="email-error"
                        className="text-sm text-red-600"
                        role="alert"
                      >
                        {clientError}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting || !!clientError}
                    >
                      {isSubmitting ? "Sending..." : "Send Login Link"}
                    </Button>
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
