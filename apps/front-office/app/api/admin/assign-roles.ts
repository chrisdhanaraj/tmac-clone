import type { LoaderFunctionArgs } from "react-router";
import prisma from "~/config/prisma";
import { logger } from "@tmac/shared/logger";

/**
 * GET /api/admin/assign-roles?emails=email1@example.com,email2@example.com
 * Internal developer tool for assigning admin roles
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Basic security check - only allow in development
  if (process.env.NODE_ENV === "production") {
    return new Response(
      JSON.stringify({ error: "Not available in production" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(request.url);
    const emailsParam = url.searchParams.get("emails");

    if (!emailsParam) {
      return new Response(
        JSON.stringify({
          error: "Missing emails parameter",
          usage:
            "GET /api/admin/assign-roles?emails=email1@example.com,email2@example.com",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const emails = emailsParam
      .split(",")
      .map(email => email.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid emails provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ensure admin role exists
    const adminRole = await prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin" },
    });

    const results = [];

    // Process each email
    for (const email of emails) {
      try {
        // Find user by email
        const user = await prisma.user.findFirst({
          where: { email },
          include: { roles: true },
        });

        if (!user) {
          results.push({
            email,
            success: false,
            message: "User not found",
          });
          continue;
        }

        // Check if user already has admin role
        const hasAdminRole = user.roles.some(
          userRole => userRole.roleId === adminRole.id
        );

        if (hasAdminRole) {
          results.push({
            email,
            success: true,
            message: "User already has admin role",
          });
          continue;
        }

        // Assign admin role
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: adminRole.id,
          },
        });

        results.push({
          email,
          success: true,
          message: "Admin role assigned successfully",
        });
      } catch (error) {
        results.push({
          email,
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${emails.length} emails: ${successCount} successful, ${failureCount} failed`,
        adminRoleId: adminRole.id,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    logger.error(error, "Error assigning admin roles");

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
