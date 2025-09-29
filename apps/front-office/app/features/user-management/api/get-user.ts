import type { LoaderFunctionArgs } from "react-router";
import { auth } from "~/features/auth/api/auth.server";
import prisma from "~/config/prisma";

/**
 * GET /api/users/:userId - Fetch single user for row refresh
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
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

  const { userId } = params;

  if (!userId) {
    return new Response(
      JSON.stringify({
        error: "User ID is required",
        code: "VALIDATION_ERROR",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Fetch single user
    const user = await prisma.user.findUnique({
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
      where: {
        id: userId,
      },
    });

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "User not found",
          code: "NOT_FOUND",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
