import type { LoaderFunctionArgs } from "react-router";
import { auth } from "~/features/auth/api/auth.server";
import prisma from "~/config/prisma";
import { UserListQuerySchema } from "~/features/user-management/validation/user-approval.schema";
import { logger } from "@tmac/shared/logger";

/**
 * GET /api/users - Paginated user listing with filtering
 */
export async function loader({ request }: LoaderFunctionArgs) {
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
    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get("page") || "1",
      pageSize: url.searchParams.get("pageSize") || "50",
      search: url.searchParams.get("search") || undefined,
      approved: url.searchParams.get("approved") || "all",
    };

    // Validate query parameters
    const validatedQuery = UserListQuerySchema.parse(queryParams);
    const { page, pageSize, search, approved } = validatedQuery;

    // Build where clause for filtering
    const whereConditions = [];

    // Add email search condition if provided
    if (search) {
      whereConditions.push({
        email: {
          contains: search,
          mode: "insensitive" as const,
        },
      });
    }

    // Add approval status condition if not "all"
    if (approved !== "all") {
      whereConditions.push({
        approved: approved === "true",
      });
    }

    // Create where clause - use AND if multiple conditions, otherwise use the single condition or empty object
    const whereClause =
      whereConditions.length > 1
        ? { AND: whereConditions }
        : whereConditions.length === 1
          ? whereConditions[0]
          : {};

    // Fetch paginated users
    const users = await prisma.user.findMany({
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
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Get total count for pagination
    const totalCount = await prisma.user.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    const result = {
      users,
      pagination: {
        currentPage: page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      totalCount,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error(error, "Error fetching users");

    if (error instanceof Error && error.message.includes("validation")) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
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
