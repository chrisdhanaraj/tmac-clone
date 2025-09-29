import { useLoaderData, useFetcher } from "react-router";
import type { PaginatedUsers } from "../validation/user-approval.schema";

/**
 * Hook for accessing user data from React Router loader
 */
export function useUsersQuery() {
  const initialData = useLoaderData() as PaginatedUsers;
  const fetcher = useFetcher<PaginatedUsers>();

  /**
   * Refetch data using fetcher.load() which returns a promise
   * Adds cache-busting timestamp to force fresh data
   */
  const refetch = async () => {
    const url = new URL(
      window.location.pathname + window.location.search,
      window.location.origin
    );
    // Add cache-busting parameter to force fresh fetch
    url.searchParams.set("_refetch", Date.now().toString());

    // fetcher.load() returns a promise that resolves when the loader completes
    await fetcher.load(url.pathname + url.search);
  };

  // Use fetcher data if available (after refetch), otherwise use initial loader data
  const data = fetcher.data || initialData;

  return {
    users: data.users,
    pagination: data.pagination,
    totalCount: data.totalCount,
    isLoading: fetcher.state === "loading",
    refetch,
  };
}
