import { useState, useEffect } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate, useFetcher } from "react-router";

// Status badge options matching create-event-form.tsx
const bookingStatusOptions = [
  {
    value: "draft",
    label: "Draft",
    variant: "secondary" as const,
  },
  { value: "ready", label: "Ready", variant: "default" as const },
  {
    value: "complete",
    label: "Complete",
    variant: "outline" as const,
  },
  {
    value: "cancelled",
    label: "Cancelled",
    variant: "destructive" as const,
  },
] as const;

// Define the booking type for the table
type BookingWithRelations = {
  id: string;
  title: string;
  status: string;
  date: Date;
  bookingTimeStart: Date;
  bookingTimeEnd: Date;
  host: {
    firstName: string;
    lastName: string;
  };
  courtLocation: {
    name: string;
  };
};

interface EventsTableProps {
  bookings: BookingWithRelations[];
}

export function EventsTable({ bookings }: EventsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const navigate = useNavigate();
  const deleteFetcher = useFetcher();

  // Handle delete success/error messages
  useEffect(() => {
    if (deleteFetcher.data) {
      if (deleteFetcher.data.success) {
        console.log("Event deleted successfully:", deleteFetcher.data.message);
      } else {
        console.error("Delete failed:", deleteFetcher.data.error);
      }
    }
  }, [deleteFetcher.data]);

  const handleRowClick = (bookingId: string) => {
    navigate(`/dashboard/events/${bookingId}/edit`);
  };

  const handleDelete = (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click

    // Confirm deletion
    if (
      window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      deleteFetcher.submit(null, {
        method: "DELETE",
        action: `/dashboard/events?id=${bookingId}`,
      });
    }
  };

  // Define table columns with delete functionality
  const columns: ColumnDef<BookingWithRelations>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-2 text-left justify-start"
          >
            Event Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div
            className="font-medium truncate"
            title={row.getValue("title") as string}
          >
            {row.getValue("title")}
          </div>
        );
      },
    },
    {
      accessorKey: "host",
      header: "Host",
      cell: ({ row }) => {
        const host = row.getValue("host") as {
          firstName: string;
          lastName: string;
        };
        const hostName = `${host.firstName} ${host.lastName}`;
        return (
          <div className="truncate max-w-[150px]" title={hostName}>
            {hostName}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusOption = bookingStatusOptions.find(
          (option) => option.value === status
        );
        return (
          <div className="w-fit">
            <Badge variant={statusOption?.variant || "default"}>
              {statusOption?.label || status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "courtLocation",
      header: "Court Location",
      cell: ({ row }) => {
        const courtLocation = row.getValue("courtLocation") as { name: string };
        return (
          <div className="truncate max-w-[150px]" title={courtLocation.name}>
            {courtLocation.name}
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-2 text-left justify-start"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("date") as Date;
        return (
          <div className="whitespace-nowrap">
            {format(new Date(date), "PPP")}
          </div>
        );
      },
    },
    {
      id: "bookingTime",
      header: "Booking Time",
      cell: ({ row }) => {
        const startTime = new Date(row.original.bookingTimeStart);
        const endTime = new Date(row.original.bookingTimeEnd);
        return (
          <div className="whitespace-nowrap">
            <div className="text-sm">
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const booking = row.original;
        const isDraft = booking.status === "draft";
        const isDeleting =
          deleteFetcher.state === "submitting" &&
          deleteFetcher.formAction?.includes(`id=${booking.id}`);

        // Only show delete button for draft events
        if (!isDraft) {
          return (
            <div className="flex items-center justify-center w-8 h-8"></div>
          );
        }

        return (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Delete event"
              disabled={isDeleting}
              onClick={(e) => handleDelete(booking.id, e)}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="sr-only">Delete {booking.title}</span>
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: bookings,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="space-y-4 min-w-0">
      {/* Show delete status messages */}
      {deleteFetcher.data && (
        <div
          className={`p-3 rounded-md text-sm ${
            deleteFetcher.data.success
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {deleteFetcher.data.success
            ? deleteFetcher.data.message
            : deleteFetcher.data.error}
        </div>
      )}

      {/* Filter Input */}
      <div className="flex items-center">
        <Input
          placeholder="Filter events..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      {/* Data Table - Scrollable Container */}
      <div className="w-full min-w-0">
        <div className="overflow-x-auto rounded-md border shadow-sm">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
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
                    No events found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of{" "}
          {table.getCoreRowModel().rows.length} event(s) shown.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
