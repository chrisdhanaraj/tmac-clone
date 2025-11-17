import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "~/config/prisma";
import { betterAuth } from "better-auth";
import { organization, magicLink } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { config } from "~/config/env";
import { loops } from "../email/loopsClient.server";
import { logger } from "@tmac/shared/logger";

// Define access control statements for events, users, and roles resources
const statement = {
  events: ["read", "create", "update", "delete"],
  users: ["read", "create", "update", "delete", "super"],
  roles: ["assign", "remove"],
} as const;

const ac = createAccessControl(statement);

// Define custom roles with specific permissions
const admin = ac.newRole({
  events: ["read", "create", "update", "delete"],
  users: ["read", "create", "update", "delete", "super"], // Admin can access PII
  roles: ["assign", "remove"],
});

const member = ac.newRole({
  events: ["read"], // Can only view published events
  users: ["read"], // Can view user roles but not edit, no PII access
  roles: [], // Cannot assign/remove roles
});

export const auth = betterAuth({
  baseURL: config.auth.baseURL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
    },
  },
  plugins: [
    magicLink({
      disableSignUp: true,
      sendMagicLink: async ({ email, url }) => {
        try {
          // Validate required environment variables
          const transactionalId = process.env.LOOPS_MAGIC_EMAIL;

          if (!transactionalId) {
            logger.error(
              "LOOPS_MAGIC_EMAIL environment variable is not configured"
            );
            throw new Error("Email service configuration error");
          }

          // Validate email template data
          if (!email || !url) {
            logger.error(
              { email: !!email, url: !!url },
              "Missing required email data"
            );
            throw new Error("Invalid email parameters");
          }

          // Send magic link email with enhanced error handling
          await loops.sendTransactionalEmail({
            transactionalId,
            email,
            dataVariables: {
              url,
            },
          });

          // Log successful email send (without sensitive data)
          logger.info(
            `Magic link email sent successfully to ${email.replace(/(.{2}).*(@.*)/, "$1***$2")}`
          );
        } catch (error) {
          // Enhanced error logging
          logger.error(
            {
              error: error instanceof Error ? error.message : "Unknown error",
              email: email?.replace(/(.{2}).*(@.*)/, "$1***$2") || "unknown",
            },
            "Magic link email delivery failed"
          );

          // Re-throw error to be handled by BetterAuth
          throw new Error("Failed to send magic link email. Please try again.");
        }
      },
    }),
    organization({
      ac,
      roles: {
        admin,
        member,
      },
    }),
  ],
});
