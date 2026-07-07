"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useURLSearch } from "@/hooks/use-url-search";
import { cn } from "@/lib/utils";

export const ProductsSearchInput = ({ className }: { className?: string }) => {
  const { searchInput, setSearchInput, isPending } = useURLSearch(350);

  return (
    <div
      data-pending={isPending ? "" : undefined}
      className={cn(
        "flex w-full items-center gap-2 data-pending:opacity-70 md:max-w-2xl",
        className,
      )}>
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/45"
        />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar peças"
          aria-label="Buscar produtos"
          className="h-11 rounded-none border-foreground/15 pl-10 text-sm"
        />
      </div>

      {searchInput && (
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Limpar busca"
          className="rounded-none border-foreground/15"
          onClick={() => setSearchInput("")}>
          <X data-icon="inline-start" />
        </Button>
      )}
    </div>
  );
};
