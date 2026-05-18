"use client";

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
import { ArrowUpDown, CalendarRange, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";

type SortPreset = {
  value: string;
  label: string;
  sortBy: "createdAt" | "name" | "updatedAt" | "displayOrder";
  sortOrder: "asc" | "desc";
};

const DEFAULT_SORT_BY = "displayOrder";
const DEFAULT_SORT_ORDER = "asc";
const DEFAULT_SORT = `${DEFAULT_SORT_BY}:${DEFAULT_SORT_ORDER}`;

const SORT_PRESETS: SortPreset[] = [
  {
    value: "displayOrder:asc",
    label: "Ordem da vitrine",
    sortBy: "displayOrder",
    sortOrder: "asc",
  },
  {
    value: "createdAt:desc",
    label: "Mais recentes",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  {
    value: "updatedAt:desc",
    label: "Atualizadas recentemente",
    sortBy: "updatedAt",
    sortOrder: "desc",
  },
  { value: "name:asc", label: "Nome (A-Z)", sortBy: "name", sortOrder: "asc" },
  {
    value: "name:desc",
    label: "Nome (Z-A)",
    sortBy: "name",
    sortOrder: "desc",
  },
];

type StatusPreset = {
  value: "all" | "true" | "false";
  label: string;
};

const STATUS_PRESETS: StatusPreset[] = [
  { value: "all", label: "Todos os status" },
  { value: "true", label: "Ativas" },
  { value: "false", label: "Inativas" },
];

const getSortValue = (sortBy?: string | null, sortOrder?: string | null) => {
  return `${sortBy ?? DEFAULT_SORT_BY}:${sortOrder ?? DEFAULT_SORT_ORDER}`;
};

const isDefaultSort = (sortBy?: string | null, sortOrder?: string | null) => {
  return getSortValue(sortBy, sortOrder) === DEFAULT_SORT;
};

type DatePreset = {
  value: string;
  label: string;
  days: number | null;
};

const DATE_PRESETS: DatePreset[] = [
  { value: "all", label: "Todo período", days: null },
  { value: "7d", label: "Últimos 7 dias", days: 7 },
  { value: "30d", label: "Últimos 30 dias", days: 30 },
  { value: "90d", label: "Últimos 90 dias", days: 90 },
  { value: "365d", label: "Último ano", days: 365 },
];

const toDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const daysAgoDateParam = (days: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);

  return toDateParam(date);
};

const matchDatePreset = (createdAtFrom: string | undefined): DatePreset => {
  if (!createdAtFrom) return DATE_PRESETS[0];

  const target = new Date(createdAtFrom).getTime();
  const tolerance = 24 * 60 * 60 * 1000;

  for (const preset of DATE_PRESETS) {
    if (preset.days === null) continue;

    const presetMs = new Date(daysAgoDateParam(preset.days)).getTime();

    if (Math.abs(presetMs - target) <= tolerance) return preset;
  }

  return { value: "custom", label: "Período personalizado", days: null };
};

export const CategoriesFilters = () => {
  const { getFilter, setFilters } = useURLFilters();

  const currentSortBy = getFilter("sortBy");
  const currentSortOrder = getFilter("sortOrder");
  const currentSort = getSortValue(currentSortBy, currentSortOrder);
  const sortIsDefault = isDefaultSort(currentSortBy, currentSortOrder);

  const currentStatus = getFilter("isActive") ?? "all";
  const statusIsDefault = currentStatus === "all";

  const createdAtFrom = getFilter("createdAtFrom");
  const activeDate = matchDatePreset(createdAtFrom);
  const dateIsDefault = !createdAtFrom;

  const handleSortChange = (value: string) => {
    const preset = SORT_PRESETS.find((p) => p.value === value);

    if (!preset) return;

    setFilters({
      sortBy: preset.sortBy === DEFAULT_SORT_BY ? null : preset.sortBy,
      sortOrder:
        preset.sortOrder === DEFAULT_SORT_ORDER ? null : preset.sortOrder,
    });
  };

  const handleStatusChange = (value: string) => {
    setFilters({
      isActive: value === "all" ? null : value,
    });
  };

  const handleDateChange = (value: string) => {
    const preset = DATE_PRESETS.find((p) => p.value === value);

    if (!preset) return;

    setFilters({
      createdAtFrom:
        preset.days === null ? null : daysAgoDateParam(preset.days),
      createdAtTo: null,
    });
  };

  return (
    <>
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger
          aria-label="Filtrar por status"
          className={cn(
            "h-9 min-w-40",
            !statusIsDefault && "border-primary/40",
          )}>
          <CircleDashed className="size-3.5 text-muted-foreground" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent position="popper" align="start">
          <SelectGroup>
            <SelectLabel>Status</SelectLabel>

            {STATUS_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={activeDate.value} onValueChange={handleDateChange}>
        <SelectTrigger
          aria-label="Filtrar por período de criação"
          className={cn("h-9 min-w-48", !dateIsDefault && "border-primary/40")}>
          <CalendarRange className="size-3.5 text-muted-foreground" />
          <SelectValue placeholder="Período" />
        </SelectTrigger>

        <SelectContent position="popper" align="start">
          <SelectGroup>
            <SelectLabel>Criada em</SelectLabel>

            {DATE_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}

            {activeDate.value === "custom" && (
              <SelectItem value="custom" disabled>
                {activeDate.label}
              </SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger
          aria-label="Ordenar categorias"
          className={cn("h-9 min-w-48", !sortIsDefault && "border-primary/40")}>
          <ArrowUpDown className="size-3.5 text-muted-foreground" />
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>

        <SelectContent position="popper" align="start">
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
    </>
  );
};

export const CATEGORY_FILTER_KEYS = [
  "sortBy",
  "sortOrder",
  "isActive",
  "createdAtFrom",
  "createdAtTo",
] as const;

export const useCategoriesActiveFiltersCount = () => {
  const { getFilter } = useURLFilters();

  let count = 0;

  const sortBy = getFilter("sortBy");
  const sortOrder = getFilter("sortOrder");

  if (!isDefaultSort(sortBy, sortOrder)) {
    count += 1;
  }

  if (getFilter("isActive")) {
    count += 1;
  }

  if (getFilter("createdAtFrom") || getFilter("createdAtTo")) {
    count += 1;
  }

  return count;
};
