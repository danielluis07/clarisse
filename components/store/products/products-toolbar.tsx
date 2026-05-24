"use client";

import { ArrowUpDown, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useURLFilters } from "@/hooks/use-url-filters";
import { cn } from "@/lib/utils";
import { ProductsSearchInput } from "@/components/store/products/products-search-input";

type SortPreset = {
  value: string;
  label: string;
  sortBy: "publishedAt" | "createdAt" | "name" | "basePriceCents";
  sortOrder: "asc" | "desc";
};

const DEFAULT_SORT_BY = "publishedAt";
const DEFAULT_SORT_ORDER = "desc";
const DEFAULT_SORT = `${DEFAULT_SORT_BY}:${DEFAULT_SORT_ORDER}`;

const SORT_PRESETS: SortPreset[] = [
  {
    value: "publishedAt:desc",
    label: "Novidades",
    sortBy: "publishedAt",
    sortOrder: "desc",
  },
  {
    value: "basePriceCents:asc",
    label: "Menor preço",
    sortBy: "basePriceCents",
    sortOrder: "asc",
  },
  {
    value: "basePriceCents:desc",
    label: "Maior preço",
    sortBy: "basePriceCents",
    sortOrder: "desc",
  },
  { value: "name:asc", label: "A-Z", sortBy: "name", sortOrder: "asc" },
  {
    value: "createdAt:desc",
    label: "Adicionados recentemente",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
];

const getSortValue = (sortBy?: string | null, sortOrder?: string | null) =>
  `${sortBy ?? DEFAULT_SORT_BY}:${sortOrder ?? DEFAULT_SORT_ORDER}`;

export const ProductsToolbar = ({
  total,
  className,
}: {
  total: number;
  className?: string;
}) => {
  const { getFilter, setFilters, clearFilters, isPending } = useURLFilters();
  const rawSort = getSortValue(getFilter("sortBy"), getFilter("sortOrder"));
  const currentSort = SORT_PRESETS.some((preset) => preset.value === rawSort)
    ? rawSort
    : DEFAULT_SORT;
  const hasSearch = Boolean(getFilter("search"));
  const hasCustomSort = currentSort !== DEFAULT_SORT;
  const hasActiveControls = hasSearch || hasCustomSort;

  const handleSortChange = (value: string) => {
    const preset = SORT_PRESETS.find((item) => item.value === value);

    if (!preset) return;

    setFilters({
      sortBy: preset.value === DEFAULT_SORT ? null : preset.sortBy,
      sortOrder: preset.value === DEFAULT_SORT ? null : preset.sortOrder,
    });
  };

  return (
    <div
      data-pending={isPending ? "" : undefined}
      className={cn(
        "flex flex-col gap-4 border-y border-foreground/10 py-5 data-pending:opacity-70 md:flex-row md:items-center md:justify-between",
        className,
      )}>
      <div className="min-w-40">
        <p className="text-sm text-foreground/60">
          {total === 1 ? "1 peça encontrada" : `${total} peças encontradas`}
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row md:flex-1 md:items-center md:justify-end">
        <ProductsSearchInput className="md:max-w-2xl lg:max-w-3xl" />

        <div className="flex shrink-0 items-center gap-2">
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger
              aria-label="Ordenar produtos"
              className="h-11 min-w-48 rounded-none border-foreground/15">
              <ArrowUpDown className="text-foreground/55" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>

            <SelectContent position="popper" align="end">
              <SelectGroup>
                <SelectLabel>Ordenar por</SelectLabel>
                {SORT_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {hasActiveControls && (
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label="Redefinir busca e ordenação"
              className="rounded-none border-foreground/15"
              onClick={() => clearFilters(["search", "sortBy", "sortOrder"])}>
              <RotateCcw data-icon="inline-start" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
