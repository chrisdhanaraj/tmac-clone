"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "~/components/ui/data-table/data-table-column-header";
import { ApprovalButton } from "./approval-button";
import type { UserDisplay } from "../validation/user-approval.schema";

interface UserTableColumnsProps {
  onUserUpdate?: (userId: string, userData: UserDisplay) => void;
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onSortClear?: () => void;
}

export function createUserTableColumns({
  onUserUpdate,
  onSortChange,
  onSortClear,
}: UserTableColumnsProps): ColumnDef<UserDisplay>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="First Name"
          onSortChange={onSortChange}
          onSortClear={onSortClear}
        />
      ),
      cell: ({ row }) => {
        const firstName = row.getValue("firstName") as string | null;
        return <div className="font-medium">{firstName || "-"}</div>;
      },
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Last Name"
          onSortChange={onSortChange}
          onSortClear={onSortClear}
        />
      ),
      cell: ({ row }) => {
        const lastName = row.getValue("lastName") as string | null;
        return <div className="font-medium">{lastName || "-"}</div>;
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Email"
          onSortChange={onSortChange}
          onSortClear={onSortClear}
        />
      ),
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return (
          <a
            href={`mailto:${email}`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {email}
          </a>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Signup Date"
          onSortChange={onSortChange}
          onSortClear={onSortClear}
        />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date;
        return (
          <div className="text-sm">
            {format(createdAt, "MMM d, yyyy 'at' h:mm a")}
          </div>
        );
      },
    },
    {
      accessorKey: "approved",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Status"
          onSortChange={onSortChange}
          onSortClear={onSortClear}
        />
      ),
      cell: ({ row }) => {
        const approved = row.getValue("approved") as boolean;
        return (
          <div
            className={`capitalize font-medium ${
              approved ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {approved ? "Approved" : "Pending"}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        const approved = row.getValue(id) as boolean;
        return value === "true" ? approved : !approved;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex items-center gap-2">
            <ApprovalButton
              userId={user.id}
              isApproved={user.approved}
              userEmail={user.email}
              onApprovalComplete={onUserUpdate}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(user.id)}
                >
                  Copy user ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(user.email)}
                >
                  Copy email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
