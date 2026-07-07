"use client";

import {
  ArrowUpDown,
  CalendarRange,
  CircleDashed,
  Folder,
  Sparkles,
  Tag,
} from "lucide-react";

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
import { useProductFormOptionsSuspense } from "@/modules/products/hooks";

type SortPreset = {
  value: string;
  label: string;
  sortBy:
    | "createdAt"
    | "updatedAt"
    | "publishedAt"
    | "name"
    | "status"
    | "basePriceCents";
  sortOrder: "asc" | "desc";
};

const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";
const DEFAULT_SORT = `${DEFAULT_SORT_BY}:${DEFAULT_SORT_ORDER}`;

const SORT_PRESETS: SortPreset[] = [
  {
    value: "createdAt:desc",
    label: "Mais recentes",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  {
    value: "updatedAt:desc",
    label: "Atualizados recentemente",
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
  {
    value: "basePriceCents:asc",
    label: "Preço (menor)",
    sortBy: "basePriceCents",
    sortOrder: "asc",
  },
  {
    value: "basePriceCents:desc",
    label: "Preço (maior)",
    sortBy: "basePriceCents",
    sortOrder: "desc",
  },
];

type StatusPreset = {
  value: "all" | "draft" | "active" | "archived";
  label: string;
};

const STATUS_PRESETS: StatusPreset[] = [
  { value: "all", label: "Todos os status" },
  { value: "draft", label: "Rascunho" },
  { value: "active", label: "Ativo" },
  { value: "archived", label: "Arquivado" },
];

type FeaturedPreset = {
  value: "all" | "true" | "false";
  label: string;
};

const FEATURED_PRESETS: FeaturedPreset[] = [
  { value: "all", label: "Todos os produtos" },
  { value: "true", label: "Em destaque" },
  { value: "false", label: "Sem destaque" },
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

const ALL_VALUE = "all";

export const ProductsFilters = () => {
  const { getFilter, setFilters } = useURLFilters();
  const { data: options } = useProductFormOptionsSuspense();

  const currentSortBy = getFilter("sortBy");
  const currentSortOrder = getFilter("sortOrder");
  const currentSort = getSortValue(currentSortBy, currentSortOrder);
  const sortIsDefault = isDefaultSort(currentSortBy, currentSortOrder);

  const currentStatus = getFilter("status") ?? ALL_VALUE;
  const statusIsDefault = currentStatus === ALL_VALUE;

  const currentCategory = getFilter("categoryId") ?? ALL_VALUE;
  const categoryIsDefault = currentCategory === ALL_VALUE;

  const currentCollection = getFilter("collectionId") ?? ALL_VALUE;
  const collectionIsDefault = currentCollection === ALL_VALUE;

  const currentFeatured = getFilter("isFeatured") ?? ALL_VALUE;
  const featuredIsDefault = currentFeatured === ALL_VALUE;

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
    setFilters({ status: value === ALL_VALUE ? null : value });
  };

  const handleCategoryChange = (value: string) => {
    setFilters({ categoryId: value === ALL_VALUE ? null : value });
  };

  const handleCollectionChange = (value: string) => {
    setFilters({ collectionId: value === ALL_VALUE ? null : value });
  };

  const handleFeaturedChange = (value: string) => {
    setFilters({ isFeatured: value === ALL_VALUE ? null : value });
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

      <Select value={currentCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger
          aria-label="Filtrar por categoria"
          className={cn(
            "h-9 min-w-44",
            !categoryIsDefault && "border-primary/40",
          )}>
          <Tag className="size-3.5 text-muted-foreground" />
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>

        <SelectContent position="popper" align="start">
          <SelectGroup>
            <SelectLabel>Categoria</SelectLabel>
            <SelectItem value={ALL_VALUE}>Todas as categorias</SelectItem>
            {options.categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
                {!category.isActive ? " (inativa)" : ""}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={currentCollection}
        onValueChange={handleCollectionChange}>
        <SelectTrigger
          aria-label="Filtrar por coleção"
          className={cn(
            "h-9 min-w-44",
            !collectionIsDefault && "border-primary/40",
          )}>
          <Folder className="size-3.5 text-muted-foreground" />
          <SelectValue placeholder="Coleção" />
        </SelectTrigger>

        <SelectContent position="popper" align="start">
          <SelectGroup>
            <SelectLabel>Coleção</SelectLabel>
            <SelectItem value={ALL_VALUE}>Todas as coleções</SelectItem>
            {options.collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name}
                {!collection.isActive ? " (inativa)" : ""}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={currentFeatured} onValueChange={handleFeaturedChange}>
        <SelectTrigger
          aria-label="Filtrar por destaque"
          className={cn(
            "h-9 min-w-40",
            !featuredIsDefault && "border-primary/40",
          )}>
          <Sparkles className="size-3.5 text-muted-foreground" />
          <SelectValue placeholder="Destaque" />
        </SelectTrigger>

        <SelectContent position="popper" align="start">
          <SelectGroup>
            <SelectLabel>Destaque</SelectLabel>

            {FEATURED_PRESETS.map((preset) => (
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
          aria-label="Ordenar produtos"
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

export const PRODUCT_FILTER_KEYS = [
  "sortBy",
  "sortOrder",
  "status",
  "categoryId",
  "collectionId",
  "isFeatured",
  "createdAtFrom",
  "createdAtTo",
] as const;

export const useProductsActiveFiltersCount = () => {
  const { getFilter } = useURLFilters();

  let count = 0;

  const sortBy = getFilter("sortBy");
  const sortOrder = getFilter("sortOrder");

  if (!isDefaultSort(sortBy, sortOrder)) count += 1;
  if (getFilter("status")) count += 1;
  if (getFilter("categoryId")) count += 1;
  if (getFilter("collectionId")) count += 1;
  if (getFilter("isFeatured")) count += 1;
  if (getFilter("createdAtFrom") || getFilter("createdAtTo")) count += 1;

  return count;
};
