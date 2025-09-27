import { z } from "zod";

/**
 * Magic Link Request Schema
 * Validates email submission for magic link authentication
 */
export const MagicLinkRequestSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email address too long"),
  callbackURL: z.string().optional().default("/user"),
});

/**
 * Magic Link Verification Schema
 * Validates magic link token and callback URL
 */
export const MagicLinkVerifySchema = z.object({
  token: z
    .string()
    .min(1, "Token is required")
    .max(512, "Invalid token format"),
  callbackURL: z.string().optional().default("/user"),
});

/**
 * Email Validation Schema (client-side)
 * For client-side email format validation
 */
export const EmailValidationSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

// Type exports for TypeScript usage
export type MagicLinkRequest = z.infer<typeof MagicLinkRequestSchema>;
export type MagicLinkVerify = z.infer<typeof MagicLinkVerifySchema>;
export type EmailValidation = z.infer<typeof EmailValidationSchema>;
