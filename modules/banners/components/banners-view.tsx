"use client";

import { Layers2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { TablePagination } from "@/components/admin/table-pagination";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  BANNER_FILTER_KEYS,
  BannersFilters,
  useBannersActiveFiltersCount,
} from "@/modules/banners/components/banners-filters";
import { useBannersSuspense, useDeleteBanners } from "@/modules/banners/hooks";
import { parseBannersSearchParams } from "@/modules/banners/utils";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useConfirm } from "@/providers/confirm-provider";
import { getDeleteErrorMessage } from "@/modules/banners/form-utils";
import { BannerCard } from "@/modules/banners/components/banner-card";

export const BannersView = () => {
  const searchParams = useSearchParams();
  const parsedParams = parseBannersSearchParams(
    Object.fromEntries(searchParams.entries()),
  );
  const { data: banners } = useBannersSuspense(parsedParams);
  const { data, pagination } = banners;
  const activeFiltersCount = useBannersActiveFiltersCount();
  const { clearFilters } = useURLFilters();
  const deleteBanners = useDeleteBanners();
  const { confirm, closeConfirm, setPending } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const pageIds = useMemo(() => data.map((banner) => banner.id), [data]);
  const visibleSelectedIds = useMemo(
    () => pageIds.filter((id) => selectedIds.has(id)),
    [pageIds, selectedIds],
  );
  const selectedCount = visibleSelectedIds.length;
  const pageSelectedCount = selectedCount;
  const allPageSelected =
    pageIds.length > 0 && pageSelectedCount === pageIds.length;
  const somePageSelected = pageSelectedCount > 0 && !allPageSelected;

  const toggleBanner = (id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const togglePage = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      pageIds.forEach((id) => {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  const handleDelete = async (ids: string[], title?: string) => {
    if (!ids.length) return;

    const confirmed = await confirm(
      ids.length === 1 ? "Excluir banner?" : "Excluir banners?",
      ids.length === 1 && title
        ? `O banner "${title}" será removido permanentemente. Esta ação não pode ser desfeita.`
        : `${ids.length} banners serão removidos permanentemente. Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setPending(true);
      await deleteBanners.mutateAsync({ ids });
      setSelectedIds((current) => {
        const next = new Set(current);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      toast.success(
        ids.length === 1
          ? "Banner excluído com sucesso."
          : "Banners excluídos com sucesso.",
      );
    } catch (error) {
      toast.error(getDeleteErrorMessage(error));
    } finally {
      closeConfirm();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5 border-b pb-5">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Banners
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Gerencie chamadas editoriais, campanhas e blocos promocionais que
          aparecem na vitrine Clarisse.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs ring-1 ring-foreground/2 md:p-5">
        <TableToolbar
          searchPlaceholder="Buscar por título, subtítulo, CTA ou URL..."
          filters={<BannersFilters />}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={() => clearFilters([...BANNER_FILTER_KEYS])}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {selectedCount > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  disabled={deleteBanners.isPending}
                  onClick={() => handleDelete(visibleSelectedIds)}>
                  <Trash2 data-icon="inline-start" />
                  Excluir selecionados
                </Button>
              )}
              <Button asChild size="lg">
                <Link href="/admin/banners/create">
                  <Plus data-icon="inline-start" />
                  Novo banner
                </Link>
              </Button>
            </div>
          }
        />

        <div className="flex flex-col gap-3 border-y py-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-fit items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={
                allPageSelected
                  ? true
                  : somePageSelected
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={(checked) => togglePage(checked === true)}
              aria-label="Selecionar banners desta página"
            />
            Selecionar página
          </label>
          <p className="text-xs text-muted-foreground">
            {selectedCount > 0
              ? `${selectedCount} selecionado${selectedCount === 1 ? "" : "s"}`
              : "Nenhum banner selecionado"}
          </p>
        </div>

        {data.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                selected={selectedIds.has(banner.id)}
                onSelectedChange={(checked) => toggleBanner(banner.id, checked)}
                onDelete={() => handleDelete([banner.id], banner.title)}
              />
            ))}
          </div>
        ) : (
          <Empty className="min-h-80 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Layers2 />
              </EmptyMedia>
              <EmptyTitle>Nenhum banner encontrado</EmptyTitle>
              <EmptyDescription>
                Ajuste os filtros ou crie um novo banner para começar a
                organizar as campanhas.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/admin/banners/create">
                  <Plus data-icon="inline-start" />
                  Novo banner
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}

        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          perPage={pagination.perPage}
        />
      </section>
    </div>
  );
};
