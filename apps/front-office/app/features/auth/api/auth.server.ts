import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "~/lib/prisma";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: "http://localhost:5173",
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
});
