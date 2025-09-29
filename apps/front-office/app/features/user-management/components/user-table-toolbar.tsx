"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { UserDisplay } from "../validation/user-approval.schema";

interface UserTableToolbarProps {
  table: Table<UserDisplay>;
  onSearchChange: (search: string) => void;
  onApprovalFilterChange: (approved: string) => void;
  currentSearch: string;
  currentApprovalFilter: string;
}

export function UserTableToolbar({
  onSearchChange,
  onApprovalFilterChange,
  currentSearch,
  currentApprovalFilter,
}: UserTableToolbarProps) {
  // Local state for immediate UI feedback
  const [searchValue, setSearchValue] = useState(currentSearch);

  // Debounce the search callback (500ms delay)
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearchChange(value);
  }, 500);

  // Sync local state with prop when it changes externally (e.g., reset button)
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value); // Update UI immediately
    debouncedSearch(value); // Trigger debounced search
  };

  const isFiltered = currentSearch !== "" || currentApprovalFilter !== "all";

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter emails..."
          value={searchValue}
          onChange={event => handleSearchChange(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <Select
          value={currentApprovalFilter}
          onValueChange={onApprovalFilterChange}
        >
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="true">Approved</SelectItem>
            <SelectItem value="false">Pending</SelectItem>
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              onSearchChange("");
              onApprovalFilterChange("all");
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
