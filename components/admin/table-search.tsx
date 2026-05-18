"use client";

import { Input } from "@/components/ui/input";
import { useURLSearch } from "@/hooks/use-url-search";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const TableSearch = ({
  placeholder = "Procurar...",
  className,
  debounceMs,
}: {
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}) => {
  const { searchInput, setSearchInput, isPending } = useURLSearch(debounceMs);

  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder={placeholder}
        className="h-9 pl-8 pr-8"
      />
      {searchInput && !isPending && (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => setSearchInput("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <X className="size-3.5" />
        </button>
      )}
      {isPending && (
        <Loader2
          aria-hidden
          className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
        />
      )}
    </div>
  );
};
