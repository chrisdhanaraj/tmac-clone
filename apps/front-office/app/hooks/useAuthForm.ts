import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "~/features/auth/api/auth-client";

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").trim(),
    lastName: z.string().min(1, "Last name is required").trim(),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

interface UseAuthFormOptions<T extends LoginFormData | SignupFormData> {
  mode: "login" | "signup";
  onSuccess?: () => void;
  redirectTo?: string;
}

/**
 * Hook for handling authentication forms (login/signup)
 * Provides form validation, submission handling, and error management
 */
export function useAuthForm<T extends LoginFormData | SignupFormData>({
  mode,
  onSuccess,
  redirectTo = "/dashboard",
}: UseAuthFormOptions<T>) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<T>({
    resolver: zodResolver(mode === "login" ? loginSchema : signupSchema) as any,
    defaultValues:
      mode === "login"
        ? ({ email: "", password: "" } as T)
        : ({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
          } as T),
  });

  const clearMessages = () => {
    setGlobalError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (data: T) => {
    clearMessages();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const loginData = data as LoginFormData;
        await authClient.signIn.email({
          email: loginData.email,
          password: loginData.password,
        });

        navigate(redirectTo);
      } else {
        const signupData = data as SignupFormData;
        const response = await authClient.signUp.email({
          name: `${signupData.firstName} ${signupData.lastName}`,
          email: signupData.email,
          password: signupData.password,
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          callbackURL: redirectTo,
        });

        if (response.error) {
          throw new Error(response.error.message || "Failed to create account");
        }

        setSuccessMessage("Account created successfully! Redirecting...");

        if (onSuccess) {
          onSuccess();
        } else {
          setTimeout(() => navigate(redirectTo), 1500);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";

      // Handle specific error cases
      if (mode === "signup") {
        if (
          errorMessage.includes("already exists") ||
          errorMessage.includes("duplicate")
        ) {
          setGlobalError("An account with this email already exists");
        } else if (
          errorMessage.includes("invalid") ||
          errorMessage.includes("format")
        ) {
          setGlobalError("Please enter a valid email address");
        } else {
          setGlobalError(errorMessage);
        }
      } else {
        setGlobalError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    globalError,
    successMessage,
    clearMessages,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}
