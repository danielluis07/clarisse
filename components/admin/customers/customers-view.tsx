"use client";

import { useCustomersSuspense } from "@/modules/customers/hooks";
import { parseCustomersSearchParams } from "@/modules/customers/utils";
import { useSearchParams } from "next/navigation";
import { columns } from "@/components/admin/customers/cutomers-columns";
import { DataTable } from "@/components/ui/data-table";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { TablePagination } from "@/components/admin/table-pagination";
import {
  CUSTOMER_FILTER_KEYS,
  CustomersFilters,
  useCustomersActiveFiltersCount,
} from "@/components/admin/customers/customers-filters";
import { useURLFilters } from "@/hooks/use-url-filters";

export const CustomersView = () => {
  const searchParams = useSearchParams();
  const parsedParams = parseCustomersSearchParams(
    Object.fromEntries(searchParams.entries()),
  );

  const { data: customers } = useCustomersSuspense(parsedParams);
  const { data, pagination } = customers;

  const activeFiltersCount = useCustomersActiveFiltersCount();
  const { clearFilters } = useURLFilters();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5 border-b pb-5">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Clientes
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Acompanhe a base de clientes da Clarisse. Busque por nome ou email
          para encontrar rapidamente um perfil.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs ring-1 ring-foreground/2 md:p-5">
        <TableToolbar
          searchPlaceholder="Buscar por nome ou email..."
          filters={<CustomersFilters />}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={() => clearFilters([...CUSTOMER_FILTER_KEYS])}
          actions={
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {pagination.total}
              </span>{" "}
              {pagination.total === 1
                ? "cliente cadastrado"
                : "clientes cadastrados"}
            </div>
          }
        />

        <DataTable columns={columns} data={data} />

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
