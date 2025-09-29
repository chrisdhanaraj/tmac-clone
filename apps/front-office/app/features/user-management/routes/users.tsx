import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { auth } from "~/features/auth/api/auth.server";
import prisma from "~/config/prisma";
import {
  UserListQuerySchema,
  type UserDisplay,
} from "../validation/user-approval.schema";
import { UserApprovalTable } from "../components/user-approval-table";
import { useUsersQuery } from "../hooks/use-users-query";
import { useBulkApproval } from "../hooks/use-bulk-approval";
import { useSearchParams } from "react-router";

/**
 * Loader: Fetch paginated user data with authentication
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Check authentication
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    throw redirect("/login");
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
    throw new Response("Forbidden", { status: 403 });
  }

  try {
    // Parse query parameters and ensure default sort is in URL
    const url = new URL(request.url);

    // If sort params are missing, redirect with defaults
    if (!url.searchParams.get("sortBy") || !url.searchParams.get("sortOrder")) {
      if (!url.searchParams.get("sortBy"))
        url.searchParams.set("sortBy", "createdAt");
      if (!url.searchParams.get("sortOrder"))
        url.searchParams.set("sortOrder", "desc");
      throw redirect(url.pathname + "?" + url.searchParams.toString());
    }

    const queryParams = {
      page: url.searchParams.get("page") || "1",
      pageSize: url.searchParams.get("pageSize") || "50",
      search: url.searchParams.get("search") || undefined,
      approved: url.searchParams.get("approved") || "all",
      sortBy: url.searchParams.get("sortBy") || "createdAt",
      sortOrder: url.searchParams.get("sortOrder") || "desc",
    };

    // Validate query parameters
    const validatedQuery = UserListQuerySchema.parse(queryParams);
    const { page, pageSize, search, approved, sortBy, sortOrder } =
      validatedQuery;

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
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Get total count for pagination
    const totalCount = await prisma.user.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
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
  } catch (error) {
    console.error("Error loading user data:", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
}

/**
 * Main Users Management Component
 */
export default function UsersManagement() {
  const {
    users: loadedUsers,
    pagination,
    totalCount,
    isLoading,
    refetch,
  } = useUsersQuery();
  const { approveUsers, isLoading: isApproving, error } = useBulkApproval();

  const [searchParams, setSearchParams] = useSearchParams();

  // Local state for users (allows row-specific updates for single approvals)
  const [users, setUsers] = useState<UserDisplay[]>(loadedUsers);

  // Sync local state when loader data changes
  useEffect(() => {
    setUsers(loadedUsers);
  }, [loadedUsers]);

  // Get current URL parameters (loader ensures sortBy and sortOrder are always present)
  const currentSearch = searchParams.get("search") || "";
  const currentApprovalFilter = searchParams.get("approved") || "all";
  const currentSortBy = searchParams.get("sortBy") || "createdAt";
  const currentSortOrder = searchParams.get("sortOrder") || "desc";

  // Helper function to update URL parameters
  const updateSearchParams = (updates: Record<string, string | number>) => {
    setSearchParams(
      prev => {
        const newParams = new URLSearchParams(prev);

        Object.entries(updates).forEach(([key, value]) => {
          if (
            value === "" ||
            value === "all" ||
            (key === "page" && value === 1)
          ) {
            newParams.delete(key);
          } else {
            newParams.set(key, String(value));
          }
        });

        return newParams;
      },
      { replace: true }
    );
  };

  // handleApprove removed - now handled internally by ApprovalButton component

  // Handle bulk approval - requery table after success
  const handleBulkApprove = async (userIds: string[]) => {
    // Step 1: Approve users via API (shows toast internally)
    await approveUsers(userIds);

    // Step 2: Refetch data and wait for completion
    await refetch();

    // Step 3: Dialog closes automatically after this function completes
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    updateSearchParams({ pageSize, page: 1 }); // Reset to first page when changing page size
  };

  const handleSearchChange = (search: string) => {
    updateSearchParams({ search, page: 1 }); // Reset to first page when searching
  };

  const handleApprovalFilterChange = (approved: string) => {
    updateSearchParams({ approved, page: 1 }); // Reset to first page when filtering
  };

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    updateSearchParams({ sortBy, sortOrder, page: 1 }); // Reset to first page when sorting
  };

  const handleSortClear = (sortBy?: string) => {
    // If clearing the default sort column (createdAt), toggle to asc instead of clearing
    if (sortBy === "createdAt") {
      updateSearchParams({ sortBy: "createdAt", sortOrder: "asc", page: 1 });
    } else {
      // For other columns, reset to default sorting
      updateSearchParams({ sortBy: "createdAt", sortOrder: "desc", page: 1 });
    }
  };

  // Handle single user update after approval (row-specific refresh)
  const handleUserUpdate = useCallback(
    (userId: string, userData: UserDisplay) => {
      setUsers(prev =>
        prev.map(user => (user.id === userId ? userData : user))
      );
    },
    []
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user approvals and access permissions
          </p>
        </div>

        <UserApprovalTable
          data={users}
          pagination={pagination}
          totalCount={totalCount}
          onBulkApprove={handleBulkApprove}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearchChange={handleSearchChange}
          onApprovalFilterChange={handleApprovalFilterChange}
          onSortChange={handleSortChange}
          onSortClear={handleSortClear}
          onUserUpdate={handleUserUpdate}
          currentSearch={currentSearch}
          currentApprovalFilter={currentApprovalFilter}
          currentSortBy={currentSortBy}
          currentSortOrder={currentSortOrder as "asc" | "desc"}
          isLoading={isLoading || isApproving}
          error={error ? new Error(error) : null}
        />
      </div>
    </div>
  );
}
