"use client";

import { TableSearch } from "@/components/admin/table-search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export const TableToolbar = ({
  searchPlaceholder,
  showSearch = true,
  filters,
  actions,
  activeFiltersCount = 0,
  onClearFilters,
  className,
}: {
  searchPlaceholder?: string;
  showSearch?: boolean;
  filters?: ReactNode;
  actions?: ReactNode;
  activeFiltersCount?: number;
  onClearFilters?: () => void;
  className?: string;
}) => {
  const showReset = activeFiltersCount > 0 && onClearFilters;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {showSearch && (
          <TableSearch
            placeholder={searchPlaceholder}
            className="max-w-full sm:max-w-xs"
          />
        )}
        {filters}
        {showReset && (
          <Button
            variant="ghost"
            type="button"
            size="sm"
            onClick={onClearFilters}
            className="h-9 text-muted-foreground hover:text-foreground rounded-md">
            <X className="size-3.5" />
            Limpar
            <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] font-medium leading-4 text-foreground">
              {activeFiltersCount}
            </span>
          </Button>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 lg:justify-end">{actions}</div>
      )}
    </div>
  );
};
