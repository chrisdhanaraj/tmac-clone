import { useState, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Instagram } from "lucide-react";

import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import { mockPlayers } from "../utils/mock-data";
import type { Route } from "./+types/roster";
import type { RosterPlayer } from "../types/roster";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tennis Roster | TMAC" },
    { name: "description", content: "Find tennis players in your community" },
  ];
}

export default function Roster() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "firstName", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState<RosterPlayer | null>(null);

  // Define columns
  const columns: ColumnDef<RosterPlayer>[] = useMemo(
    () => [
      {
        id: "firstName",
        accessorFn: (row) => row.firstName,
        header: "Player",
        cell: ({ row }) => {
          const player = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">
                  {player.firstName[0]}
                  {player.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {player.firstName} {player.lastName[0]}.
                </div>
                {!player.isProfileComplete && (
                  <span className="text-xs text-amber-600">Incomplete profile</span>
                )}
              </div>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          const player = row.original;
          const fullName = `${player.firstName} ${player.lastName}`;
          return fullName.toLowerCase().includes(value.toLowerCase());
        },
      },
      {
        accessorKey: "district",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4"
            >
              District
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const district = row.original.district;
          return (
            <div className="font-medium">
              {district.replace("District", "")}
            </div>
          );
        },
      },
      {
        accessorKey: "tennisRanking",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4"
            >
              Level
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const ranking = row.original.tennisRanking;
          return (
            <Badge variant="secondary" className="font-mono">
              {ranking.replace(/_/g, ".")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "playingStyles",
        header: "Playing Style",
        cell: ({ row }) => {
          const styles = row.original.playingStyles;
          return (
            <div className="flex flex-wrap gap-1">
              {styles.map((style) => (
                <Badge key={style} variant="outline" className="text-xs">
                  {style}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "availability",
        header: "Availability",
        cell: ({ row }) => {
          const availability = row.original.availability;
          if (availability.length === 0) {
            return <span className="text-muted-foreground text-sm">Not set</span>;
          }
          return (
            <div className="text-sm">
              {availability.slice(0, 2).map((a, i) => (
                <div key={i} className="text-muted-foreground">
                  {a.day.slice(0, 3)} {a.timePreference === "AllDay" ? "All" : a.timePreference}
                </div>
              ))}
              {availability.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{availability.length - 2} more
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "instagramHandle",
        header: "Contact",
        cell: ({ row }) => {
          const instagram = row.original.instagramHandle;
          if (!instagram) return null;
          return (
            <a
              href={`https://instagram.com/${instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              <Instagram className="h-3 w-3" />
              {instagram}
            </a>
          );
        },
      },
      {
        accessorKey: "tennisRoles",
        header: "Roles",
        cell: ({ row }) => {
          const roles = row.original.tennisRoles;
          return (
            <div className="flex flex-wrap gap-1">
              {roles.map((role) => (
                <Badge key={role.id} className="text-xs">
                  {role.name}
                </Badge>
              ))}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: mockPlayers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-xl font-semibold">Tennis Roster</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4">
        <div className="h-full flex flex-col max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex items-center gap-4 pb-4">
            <Input
              placeholder="Search players..."
              value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("firstName")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <div className="ml-auto flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {table.getFilteredRowModel().rows.length} players
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer"
                      onClick={() => setSelectedPlayer(row.original)}
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              of {table.getFilteredRowModel().rows.length} players
            </div>
            <div className="flex items-center space-x-2">
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
      </main>

      {/* Player Detail Modal */}
      <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {selectedPlayer.firstName[0]}
                      {selectedPlayer.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {selectedPlayer.firstName} {selectedPlayer.lastName}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      District {selectedPlayer.district.replace("District", "")} • {" "}
                      {selectedPlayer.tennisRanking.replace(/_/g, ".")}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Contact */}
                {selectedPlayer.instagramHandle && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Contact</h3>
                    <a
                      href={`https://instagram.com/${selectedPlayer.instagramHandle.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Instagram className="h-4 w-4" />
                      {selectedPlayer.instagramHandle}
                    </a>
                  </div>
                )}

                {/* Playing Styles */}
                {selectedPlayer.playingStyles.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Playing Styles</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlayer.playingStyles.map((style) => (
                        <Badge key={style} variant="outline">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Match Formats */}
                {selectedPlayer.matchFormats.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Match Formats</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlayer.matchFormats.map((format) => (
                        <Badge key={format} variant="secondary">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability */}
                {selectedPlayer.availability.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Availability</h3>
                    <div className="space-y-1">
                      {selectedPlayer.availability.map((a, i) => (
                        <div key={i} className="text-sm">
                          {a.day} - {a.timePreference === "AllDay" ? "All Day" : a.timePreference}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Roles */}
                {selectedPlayer.tennisRoles.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Roles</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlayer.tennisRoles.map((role) => (
                        <div key={role.id}>
                          <Badge className="mb-1">{role.name}</Badge>
                          {role.description && (
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personal Info */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Personal Touch</h3>
                  <div className="space-y-2 text-sm">
                    {selectedPlayer.favoriteTennisPlayer && (
                      <div>
                        <span className="text-muted-foreground">Favorite Player:</span>{" "}
                        {selectedPlayer.favoriteTennisPlayer}
                      </div>
                    )}
                    {selectedPlayer.playlistSong && (
                      <div>
                        <span className="text-muted-foreground">Playlist Song:</span>{" "}
                        {selectedPlayer.playlistSong}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Events */}
                {selectedPlayer.upcomingEvents && selectedPlayer.upcomingEvents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Upcoming Events</h3>
                    <div className="space-y-2">
                      {selectedPlayer.upcomingEvents.map((event) => (
                        <div key={event.id} className="text-sm p-3 bg-muted rounded-lg">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-muted-foreground">
                            {event.date.toLocaleDateString()} • {event.location}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}