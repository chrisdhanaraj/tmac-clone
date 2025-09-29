"use client";

import { useState } from "react";
import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { DataTablePagination } from "~/components/ui/data-table/data-table-pagination";
import { UserTableToolbar } from "./user-table-toolbar";
import { BulkApprovalActions } from "./bulk-approval-actions";
import { createUserTableColumns } from "./user-table-columns";
import type {
  UserDisplay,
  PaginationInfo,
} from "../validation/user-approval.schema";

interface UserApprovalTableProps {
  data: UserDisplay[];
  pagination: PaginationInfo;
  totalCount: number;
  onBulkApprove: (userIds: string[]) => Promise<void>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (search: string) => void;
  onApprovalFilterChange: (approved: string) => void;
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onSortClear: () => void;
  onUserUpdate?: (userId: string, userData: UserDisplay) => void;
  onClearSelection?: () => void;
  currentSearch: string;
  currentApprovalFilter: string;
  currentSortBy: string;
  currentSortOrder: "asc" | "desc";
  isLoading?: boolean;
  error?: Error | null;
}

export function UserApprovalTable({
  data,
  pagination,
  totalCount,
  onBulkApprove,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onApprovalFilterChange,
  onSortChange,
  onSortClear,
  onUserUpdate,
  currentSearch,
  currentApprovalFilter,
  currentSortBy,
  currentSortOrder,
  isLoading = false,
  error = null,
}: UserApprovalTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Convert current sorting from URL params to TanStack Table format
  const sorting: SortingState = currentSortBy
    ? [{ id: currentSortBy, desc: currentSortOrder === "desc" }]
    : [];

  // Clear row selection when onBulkApprove callback changes (after bulk approval completes)
  const clearRowSelection = () => setRowSelection({});

  const columns = createUserTableColumns({
    onUserUpdate,
    onSortChange,
    onSortClear,
  });

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true, // Enable server-side pagination
    manualSorting: true, // Enable server-side sorting
    pageCount: pagination.totalPages,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: pagination.currentPage - 1, // TanStack uses 0-based indexing
        pageSize: pagination.pageSize,
      },
    },
  });

  const selectedUserIds = table
    .getFilteredSelectedRowModel()
    .rows.map(row => row.original.id);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-red-600 mb-4">
          Error loading users: {error.message}
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <UserTableToolbar
          table={table}
          onSearchChange={onSearchChange}
          onApprovalFilterChange={onApprovalFilterChange}
          currentSearch={currentSearch}
          currentApprovalFilter={currentApprovalFilter}
        />
        <BulkApprovalActions
          selectedUserIds={selectedUserIds}
          onBulkApprove={onBulkApprove}
          onClearSelection={clearRowSelection}
        />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table aria-label="User approval table">
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        totalCount={totalCount}
        pagination={pagination}
      />
    </div>
  );
}
