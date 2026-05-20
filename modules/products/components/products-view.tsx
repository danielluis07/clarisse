"use client";

import type { Row } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { TablePagination } from "@/components/admin/table-pagination";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useURLFilters } from "@/hooks/use-url-filters";
import { columns } from "@/modules/products/components/products-columns";
import {
  PRODUCT_FILTER_KEYS,
  ProductsFilters,
  useProductsActiveFiltersCount,
} from "@/modules/products/components/products-filters";
import {
  useDeleteProducts,
  useProductsSuspense,
} from "@/modules/products/hooks";
import type { ProductListItem } from "@/modules/products/types";
import { parseProductsSearchParams } from "@/modules/products/utils";

const getErrorMessage = (error: unknown) => {
  return error instanceof Error
    ? error.message
    : "Não foi possível excluir os produtos.";
};

export const ProductsView = () => {
  const searchParams = useSearchParams();
  const parsedParams = parseProductsSearchParams(
    Object.fromEntries(searchParams.entries()),
  );

  const { data: products } = useProductsSuspense(parsedParams);
  const { data, pagination } = products;

  const activeFiltersCount = useProductsActiveFiltersCount();
  const { clearFilters } = useURLFilters();
  const deleteProducts = useDeleteProducts();

  const handleDeleteRows = async (rows: Row<ProductListItem>[]) => {
    const ids = rows.map((row) => row.original.id);

    try {
      await deleteProducts.mutateAsync({ ids });
      toast.success(
        ids.length === 1
          ? "Produto excluído com sucesso."
          : "Produtos excluídos com sucesso.",
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5 border-b pb-5">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Produtos
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Cadastro de peças, variações, imagens e estoque. Busque por nome,
          slug, descrição ou SKU.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs ring-1 ring-foreground/2 md:p-5">
        <TableToolbar
          searchPlaceholder="Buscar por nome, slug, SKU..."
          filters={<ProductsFilters />}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={() => clearFilters([...PRODUCT_FILTER_KEYS])}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/admin/products/create">
                  <Plus data-icon="inline-start" />
                  Novo produto
                </Link>
              </Button>
            </div>
          }
        />

        <DataTable
          columns={columns}
          data={data}
          getRowId={(product) => String(product.id)}
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
