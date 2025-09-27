import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "~/config/prisma";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { config } from "~/config/env";

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

const eventManager = ac.newRole({
  events: ["read", "create", "update", "delete"],
  users: ["read"], // Can view user roles but not edit, no PII access
  roles: [], // Cannot assign/remove roles
});

const member = ac.newRole({
  events: ["read"], // Can only view published events
  users: ["read"], // Can view user roles but not edit, no PII access
  roles: [], // Cannot assign/remove roles
});

export const auth = betterAuth({
  baseURL: config.auth.baseURL,
  emailAndPassword: {
    enabled: true,
  },
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
    organization({
      ac,
      roles: {
        admin,
        event_manager: eventManager,
        member,
      },
    }),
  ],
});
