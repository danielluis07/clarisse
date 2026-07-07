"use client";

import { DataTable } from "@/components/ui/data-table";
import { TablePagination } from "@/components/admin/table-pagination";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { Button } from "@/components/ui/button";
import { useURLFilters } from "@/hooks/use-url-filters";
import { columns } from "@/modules/categories/components/categories-columns";
import {
  CategoriesFilters,
  CATEGORY_FILTER_KEYS,
  useCategoriesActiveFiltersCount,
} from "@/modules/categories/components/categories-filters";
import {
  useCategoriesSuspense,
  useDeleteCategories,
} from "@/modules/categories/hooks";
import type { CategoryOutput } from "@/modules/categories/types";
import { parseCategoriesSearchParams } from "@/modules/categories/params";
import type { Row } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const getErrorMessage = (error: unknown) => {
  return error instanceof Error
    ? error.message
    : "Não foi possível excluir as categorias.";
};

export const CategoriesView = () => {
  const searchParams = useSearchParams();
  const parsedParams = parseCategoriesSearchParams(
    Object.fromEntries(searchParams.entries()),
  );

  const { data: categories } = useCategoriesSuspense(parsedParams);
  const { data, pagination } = categories;

  const activeFiltersCount = useCategoriesActiveFiltersCount();
  const { clearFilters } = useURLFilters();
  const deleteCategories = useDeleteCategories();

  const handleDeleteRows = async (rows: Row<CategoryOutput>[]) => {
    const ids = rows.map((row) => row.original.id);

    try {
      await deleteCategories.mutateAsync({ ids });
      toast.success(
        ids.length === 1
          ? "Categoria excluída com sucesso."
          : "Categorias excluídas com sucesso.",
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5 border-b pb-5">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Categorias
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Organize a navegação estrutural da loja por tipo de produto, como
          blazers, vestidos, bolsas e camisas.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs ring-1 ring-foreground/2 md:p-5">
        <TableToolbar
          searchPlaceholder="Buscar por nome, slug ou descrição..."
          filters={<CategoriesFilters />}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={() => clearFilters([...CATEGORY_FILTER_KEYS])}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/admin/categories/create">
                  <Plus data-icon="inline-start" />
                  Nova categoria
                </Link>
              </Button>
            </div>
          }
        />

        <DataTable
          columns={columns}
          data={data}
          getRowId={(category) => String(category.id)}
          manualPagination
          manualSorting
          manualFiltering
          onDelete={handleDeleteRows}
        />

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
