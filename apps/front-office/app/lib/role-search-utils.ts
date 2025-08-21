import React, { useCallback } from "react";
import { useSearchParams } from "react-router";
import type { RoleFilters, RoleStatus, RoleAssignmentCount, RoleSortOption } from "~/components/blocks/role-filters";
import type { tennisRolesModel } from "~/generated/prisma/models/tennisRoles";

// Type for tennis role with user count
export type TennisRoleWithCount = tennisRolesModel & {
  _count: {
    users: number;
  };
};

// URL parameter keys
const SEARCH_PARAM_KEYS = {
  query: "q",
  status: "status",
  assignment: "assignment", 
  sort: "sort",
  page: "page",
} as const;

// Default values
const DEFAULT_SEARCH_PARAMS = {
  query: "",
  status: "all" as RoleStatus,
  assignment: "all" as RoleAssignmentCount,
  sort: "name-asc" as RoleSortOption,
  page: 1,
};

/**
 * Hook for managing search and filter state with URL synchronization
 */
export function useRoleSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current values from URL or defaults
  const getCurrentState = useCallback(() => {
    return {
      query: searchParams.get(SEARCH_PARAM_KEYS.query) || DEFAULT_SEARCH_PARAMS.query,
      status: (searchParams.get(SEARCH_PARAM_KEYS.status) as RoleStatus) || DEFAULT_SEARCH_PARAMS.status,
      assignment: (searchParams.get(SEARCH_PARAM_KEYS.assignment) as RoleAssignmentCount) || DEFAULT_SEARCH_PARAMS.assignment,
      sort: (searchParams.get(SEARCH_PARAM_KEYS.sort) as RoleSortOption) || DEFAULT_SEARCH_PARAMS.sort,
      page: parseInt(searchParams.get(SEARCH_PARAM_KEYS.page) || "1", 10),
    };
  }, [searchParams]);

  // Update search params
  const updateSearchParams = useCallback((updates: Partial<typeof DEFAULT_SEARCH_PARAMS>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      Object.entries(updates).forEach(([key, value]) => {
        const paramKey = SEARCH_PARAM_KEYS[key as keyof typeof SEARCH_PARAM_KEYS];
        if (value === DEFAULT_SEARCH_PARAMS[key as keyof typeof DEFAULT_SEARCH_PARAMS] || !value) {
          newParams.delete(paramKey);
        } else {
          newParams.set(paramKey, String(value));
        }
      });

      // Reset page to 1 when filters change (except when explicitly updating page)
      if (!("page" in updates) && Object.keys(updates).some(key => key !== "page")) {
        newParams.delete(SEARCH_PARAM_KEYS.page);
      }

      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  // Individual update functions
  const setQuery = useCallback((query: string) => {
    updateSearchParams({ query });
  }, [updateSearchParams]);

  const setFilters = useCallback((filters: RoleFilters) => {
    updateSearchParams({
      status: filters.status,
      assignment: filters.assignmentCount,
      sort: filters.sortBy,
    });
  }, [updateSearchParams]);

  const setPage = useCallback((page: number) => {
    updateSearchParams({ page });
  }, [updateSearchParams]);

  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return {
    state: getCurrentState(),
    setQuery,
    setFilters,
    setPage,
    clearAll,
  };
}

/**
 * Apply search and filters to tennis roles data
 */
export function filterAndSearchRoles(
  roles: TennisRoleWithCount[],
  query: string,
  filters: RoleFilters
): TennisRoleWithCount[] {
  let filtered = [...roles];

  // Apply search filter
  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    filtered = filtered.filter(role => 
      role.name.toLowerCase().includes(searchTerm) ||
      role.description.toLowerCase().includes(searchTerm)
    );
  }

  // Apply status filter
  if (filters.status !== "all") {
    filtered = filtered.filter(role => 
      filters.status === "active" ? role.isActive : !role.isActive
    );
  }

  // Apply assignment count filter
  if (filters.assignmentCount !== "all") {
    filtered = filtered.filter(role => {
      const userCount = role._count?.users || 0;
      switch (filters.assignmentCount) {
        case "many": return userCount >= 10;
        case "few": return userCount >= 1 && userCount <= 9;
        case "none": return userCount === 0;
        default: return true;
      }
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "created-asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "created-desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "users-asc":
        return (a._count?.users || 0) - (b._count?.users || 0);
      case "users-desc":
        return (b._count?.users || 0) - (a._count?.users || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return filtered;
}

/**
 * Generate Prisma where clause from search query and filters
 */
export function generateRoleWhereClause(query: string, filters: RoleFilters) {
  const where: any = {};

  // Search conditions
  if (query.trim()) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  // Status filter
  if (filters.status !== "all") {
    where.isActive = filters.status === "active";
  }

  return where;
}

/**
 * Generate Prisma orderBy clause from sort option
 */
export function generateRoleOrderBy(sortBy: RoleSortOption) {
  switch (sortBy) {
    case "name-asc":
      return { name: "asc" };
    case "name-desc":
      return { name: "desc" };
    case "created-asc":
      return { createdAt: "asc" };
    case "created-desc":
      return { createdAt: "desc" };
    case "users-asc":
      return { users: { _count: "asc" } };
    case "users-desc":
      return { users: { _count: "desc" } };
    default:
      return { name: "asc" };
  }
}

/**
 * Generate Prisma having clause for assignment count filter
 */
export function generateRoleHavingClause(assignmentCount: RoleAssignmentCount) {
  if (assignmentCount === "all") return undefined;

  switch (assignmentCount) {
    case "many":
      return { users: { _count: { gte: 10 } } };
    case "few":
      return { 
        AND: [
          { users: { _count: { gte: 1 } } },
          { users: { _count: { lte: 9 } } }
        ]
      };
    case "none":
      return { users: { _count: { equals: 0 } } };
    default:
      return undefined;
  }
}

/**
 * Pagination utility
 */
export function paginateResults<T>(items: T[], page: number, pageSize = 10) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    items: items.slice(startIndex, endIndex),
    totalItems: items.length,
    totalPages: Math.ceil(items.length / pageSize),
    currentPage: page,
    pageSize,
    hasNextPage: endIndex < items.length,
    hasPreviousPage: page > 1,
  };
}

/**
 * Highlight search terms in text for display
 * This is a utility function that returns the highlighting logic
 * The actual JSX creation should be done in components
 */
export function createHighlightFunction(
  searchQuery: string, 
  className = "bg-yellow-200 dark:bg-yellow-900/50 px-1 py-0.5 rounded"
) {
  return (text: string): React.ReactNode => {
    if (!searchQuery.trim() || !text) return text;

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        React.createElement('mark', { key: index, className }, part)
      ) : (
        part
      )
    );
  };
}

/**
 * Debounce function for search inputs
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}