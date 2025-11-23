import type { ActionFunctionArgs } from "react-router";
import { auth } from "~/features/auth/api/auth.server";
import prisma from "~/config/prisma";
import { LoopsClient } from "loops";
import { UserApprovalSchema } from "~/features/user-management/validation/user-approval.schema";
import { logger } from "@tmac/shared/logger";

/**
 * POST /api/users/approve - User approval (single or bulk)
 */
export async function action({ request }: ActionFunctionArgs) {
  // Check authentication
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return new Response(
      JSON.stringify({
        error: "Authentication required",
        code: "UNAUTHORIZED",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check admin role
  const adminRoleCount = await prisma.userRole.count({
    where: {
      userId: session.user.id,
      role: {
        name: "admin",
      },
    },
  });

  if (adminRoleCount === 0) {
    return new Response(
      JSON.stringify({ error: "Admin role required", code: "FORBIDDEN" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = UserApprovalSchema.parse(body);

    if (validatedData.userIds.length > 100) {
      return new Response(
        JSON.stringify({
          error: "Cannot approve more than 100 users at once",
          code: "LIMIT_EXCEEDED",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Perform bulk approval using updateMany for efficiency
    const updateResult = await prisma.user.updateMany({
      where: {
        id: {
          in: validatedData.userIds,
        },
      },
      data: {
        approved: true,
      },
    });

    // Get the updated users for response and email notifications
    const updatedUsers = await prisma.user.findMany({
      where: {
        id: {
          in: validatedData.userIds,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        approved: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send email notifications
    const emailResults = [];
    const apiKey = process.env.LOOPS_API_KEY;
    const templateId = process.env.LOOPS_USER_APPROVAL_TEMPLATE_ID;

    for (const user of updatedUsers) {
      let emailSent = false;

      try {
        if (apiKey && templateId) {
          const loops = new LoopsClient(apiKey);
          const response = await loops.sendTransactionalEmail({
            transactionalId: templateId,
            email: user.email,
            dataVariables: {
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email,
            },
          });
          emailSent = response.success;
        }
      } catch (emailError) {
        logger.error(emailError, `Failed to send email for user ${user.id}`);
      }

      emailResults.push({
        userId: user.id,
        success: true,
        emailSent,
        user, // Include full user object for client-side row update
      });
    }

    // Handle users that weren't found
    const foundUserIds = updatedUsers.map(u => u.id);
    const notFoundUserIds = validatedData.userIds.filter(
      id => !foundUserIds.includes(id)
    );

    for (const userId of notFoundUserIds) {
      emailResults.push({
        userId,
        success: false,
        error: "User not found",
        emailSent: false,
      });
    }

    const approvedCount = updateResult.count;
    const failedCount = notFoundUserIds.length;

    const message = `${approvedCount} users approved successfully${
      failedCount > 0 ? `, ${failedCount} failed` : ""
    }`;

    return new Response(
      JSON.stringify({
        success: true,
        message,
        results: emailResults,
        approvedCount,
        failedCount,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    logger.error(error, "Error in bulk approval");

    if (error instanceof Error && error.message.includes("validation")) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          code: "VALIDATION_ERROR",
          details: error.message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
