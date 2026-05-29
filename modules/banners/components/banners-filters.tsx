"use client";

import { ArrowUpDown, CalendarRange, CircleDashed, MapPin } from "lucide-react";

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
import { bannerPlacementLabels } from "@/modules/banners/constants";
import {
  bannerPlacementSchema,
  contentStatusSchema,
} from "@/modules/banners/validations";

type SortPreset = {
  value: string;
  label: string;
  sortBy: "createdAt" | "updatedAt" | "title" | "placement" | "status";
  sortOrder: "asc" | "desc";
};

const DEFAULT_SORT_BY = "updatedAt";
const DEFAULT_SORT_ORDER = "desc";
const DEFAULT_SORT = `${DEFAULT_SORT_BY}:${DEFAULT_SORT_ORDER}`;

const SORT_PRESETS: SortPreset[] = [
  {
    value: "updatedAt:desc",
    label: "Atualizados recentemente",
    sortBy: "updatedAt",
    sortOrder: "desc",
  },
  {
    value: "createdAt:desc",
    label: "Mais recentes",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  { value: "title:asc", label: "Título (A-Z)", sortBy: "title", sortOrder: "asc" },
  { value: "title:desc", label: "Título (Z-A)", sortBy: "title", sortOrder: "desc" },
];

const STATUS_LABELS = {
  all: "Todos os status",
  draft: "Rascunhos",
  active: "Ativos",
  archived: "Arquivados",
} as const;

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

const getSortValue = (sortBy?: string | null, sortOrder?: string | null) =>
  `${sortBy ?? DEFAULT_SORT_BY}:${sortOrder ?? DEFAULT_SORT_ORDER}`;

const isDefaultSort = (sortBy?: string | null, sortOrder?: string | null) =>
  getSortValue(sortBy, sortOrder) === DEFAULT_SORT;

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

export const BannersFilters = () => {
  const { getFilter, setFilters } = useURLFilters();

  const currentSortBy = getFilter("sortBy");
  const currentSortOrder = getFilter("sortOrder");
  const currentSort = getSortValue(currentSortBy, currentSortOrder);
  const sortIsDefault = isDefaultSort(currentSortBy, currentSortOrder);

  const currentPlacement = getFilter("placement") ?? "all";
  const placementIsDefault = currentPlacement === "all";

  const currentStatus = getFilter("status") ?? "all";
  const statusIsDefault = currentStatus === "all";

  const createdAtFrom = getFilter("createdAtFrom");
  const activeDate = matchDatePreset(createdAtFrom);
  const dateIsDefault = !createdAtFrom;

  const handleSortChange = (value: string) => {
    const preset = SORT_PRESETS.find((item) => item.value === value);
    if (!preset) return;

    setFilters({
      sortBy: preset.sortBy === DEFAULT_SORT_BY ? null : preset.sortBy,
      sortOrder:
        preset.sortOrder === DEFAULT_SORT_ORDER ? null : preset.sortOrder,
    });
  };

  const handlePlacementChange = (value: string) => {
    setFilters({
      placement: value === "all" ? null : value,
    });
  };

  const handleStatusChange = (value: string) => {
    setFilters({
      status: value === "all" ? null : value,
    });
  };

  const handleDateChange = (value: string) => {
    const preset = DATE_PRESETS.find((item) => item.value === value);
    if (!preset) return;

    setFilters({
      createdAtFrom:
        preset.days === null ? null : daysAgoDateParam(preset.days),
      createdAtTo: null,
    });
  };

  return (
    <>
      <Select value={currentPlacement} onValueChange={handlePlacementChange}>
        <SelectTrigger
          aria-label="Filtrar por posicionamento"
          className={cn(
            "h-9 min-w-48",
            !placementIsDefault && "border-primary/40",
          )}>
          <MapPin data-icon="inline-start" />
          <SelectValue placeholder="Posição" />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectGroup>
            <SelectLabel>Posição</SelectLabel>
            <SelectItem value="all">Todas as posições</SelectItem>
            {bannerPlacementSchema.options.map((placement) => (
              <SelectItem key={placement} value={placement}>
                {bannerPlacementLabels[placement]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger
          aria-label="Filtrar por status"
          className={cn(
            "h-9 min-w-40",
            !statusIsDefault && "border-primary/40",
          )}>
          <CircleDashed data-icon="inline-start" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectGroup>
            <SelectLabel>Status</SelectLabel>
            <SelectItem value="all">{STATUS_LABELS.all}</SelectItem>
            {contentStatusSchema.options.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={activeDate.value} onValueChange={handleDateChange}>
        <SelectTrigger
          aria-label="Filtrar por período de criação"
          className={cn("h-9 min-w-48", !dateIsDefault && "border-primary/40")}>
          <CalendarRange data-icon="inline-start" />
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectGroup>
            <SelectLabel>Criado em</SelectLabel>
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
          aria-label="Ordenar banners"
          className={cn("h-9 min-w-48", !sortIsDefault && "border-primary/40")}>
          <ArrowUpDown data-icon="inline-start" />
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

export const BANNER_FILTER_KEYS = [
  "sortBy",
  "sortOrder",
  "placement",
  "status",
  "createdAtFrom",
  "createdAtTo",
] as const;

export const useBannersActiveFiltersCount = () => {
  const { getFilter } = useURLFilters();
  let count = 0;

  const sortBy = getFilter("sortBy");
  const sortOrder = getFilter("sortOrder");

  if (!isDefaultSort(sortBy, sortOrder)) count += 1;
  if (getFilter("placement")) count += 1;
  if (getFilter("status")) count += 1;
  if (getFilter("createdAtFrom") || getFilter("createdAtTo")) count += 1;

  return count;
};
