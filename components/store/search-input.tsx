"use client";

import { Input } from "@/components/ui/input";
import { useURLSearch } from "@/hooks/use-url-search";

export const SearchInput = () => {
  const { searchInput, setSearchInput, isPending } = useURLSearch();

  return (
    <Input
      value={searchInput}
      onChange={(event) => setSearchInput(event.target.value)}
      placeholder="Buscar..."
      aria-label="Buscar"
      aria-busy={isPending || undefined}
    />
  );
};
