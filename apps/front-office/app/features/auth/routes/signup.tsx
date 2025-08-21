import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/signup";
import { cn } from "~/utils/utils";
import { authClient } from "~/features/auth/api/auth-client";
import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up - Front Office" },
    { name: "description", content: "Create your Front Office account" },
  ];
}

export default function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Clear messages when user starts typing
  const clearMessages = () => {
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authClient.signUp.email({
        name: `${firstName} ${lastName}`,
        email,
        password,
        firstName,
        lastName,
        callbackURL: "/dashboard",
      });

      // Check if signup was successful
      if (response.error) {
        throw new Error(response.error.message || "Failed to create account");
      }

      // Show success message before redirecting
      setSuccess("Account created successfully! Redirecting to login...");
    } catch (err) {
      // Handle specific error cases
      if (err instanceof Error) {
        if (
          err.message.includes("already exists") ||
          err.message.includes("duplicate")
        ) {
          setError("An account with this email already exists");
        } else if (
          err.message.includes("invalid") ||
          err.message.includes("format")
        ) {
          setError("Please enter a valid email address");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 pattern-dots">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6")}>
          {/* Enhanced header with gradient text */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold heading-gradient">
                Front Office
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Account
            </h1>
            <p className="text-muted-foreground">
              Join thousands of users already on Front Office
            </p>
          </div>

          <Card className="modern-card border-2">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              </div>
              <CardDescription className="text-base">
                Create an account to get started with Front Office
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium"
                      >
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        required
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          clearMessages();
                        }}
                        disabled={isLoading}
                        className="focus-enhanced h-11 transition-all duration-200 border-2 focus:border-primary/50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        required
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          clearMessages();
                        }}
                        disabled={isLoading}
                        className="focus-enhanced h-11 transition-all duration-200 border-2 focus:border-primary/50"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearMessages();
                      }}
                      disabled={isLoading}
                      className="focus-enhanced h-11 transition-all duration-200 border-2 focus:border-primary/50"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearMessages();
                      }}
                      disabled={isLoading}
                      className="focus-enhanced h-11 transition-all duration-200 border-2 focus:border-primary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearMessages();
                      }}
                      disabled={isLoading}
                      className="focus-enhanced h-11 transition-all duration-200 border-2 focus:border-primary/50"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive-foreground">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4 text-sm text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="enhanced-button w-full h-11 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground"></div>
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <a
                      href="/"
                      className="font-medium text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                    >
                      Sign in
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Trust indicators */}
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p>🔒 Your data is secure and encrypted</p>
            <p>✨ Join thousands of satisfied users</p>
          </div>
        </div>
      </div>
    </div>
  );
}
