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
import { useCategoriesSuspense } from "@/modules/categories/hooks";
import { parseCategoriesSearchParams } from "@/modules/categories/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export const CategoriesView = () => {
  const searchParams = useSearchParams();
  const parsedParams = parseCategoriesSearchParams(
    Object.fromEntries(searchParams.entries()),
  );

  const { data: categories } = useCategoriesSuspense(parsedParams);
  const { data, pagination } = categories;

  const activeFiltersCount = useCategoriesActiveFiltersCount();
  const { clearFilters } = useURLFilters();

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
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {pagination.total}
                </span>{" "}
                {pagination.total === 1
                  ? "categoria cadastrada"
                  : "categorias cadastradas"}
              </div>
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
