import { useRouteError, isRouteErrorResponse, Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

/**
 * Error boundary component for handling route errors
 * Displays user-friendly error messages and recovery options
 */
export function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage: string;
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.data?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = "An unexpected error occurred";
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>
              {errorStatus === 404 ? "Page Not Found" : "Something went wrong"}
            </CardTitle>
          </div>
          <CardDescription>
            {errorStatus === 404
              ? "The page you're looking for doesn't exist."
              : "We encountered an error while processing your request."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
          )}

          {isDevelopment && error instanceof Error && error.stack && (
            <details className="cursor-pointer">
              <summary className="text-sm font-medium">Stack trace</summary>
              <pre className="mt-2 overflow-auto rounded-md bg-muted p-3 text-xs">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild className="flex-1">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Generic error boundary for non-route errors
 */
export class GenericErrorBoundary extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenericErrorBoundary";
  }
}
