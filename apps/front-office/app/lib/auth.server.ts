import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
        fieldName: "first_name",
      },
      lastName: {
        type: "string",
        required: true,
        fieldName: "last_name",
      },
    },
  },
});
