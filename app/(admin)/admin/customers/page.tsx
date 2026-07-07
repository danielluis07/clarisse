import { requireAdmin } from "@/lib/auth-utils";
import { prefetchCustomers } from "@/modules/customers/server/prefetch";
import { parseCustomersSearchParams } from "@/modules/customers/params";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { CustomersView } from "@/modules/customers/components/customers-view";

const CustomersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  await requireAdmin();
  const rawParams = await searchParams;
  const parsedParams = parseCustomersSearchParams(rawParams);

  prefetchCustomers(parsedParams);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<p>Falha ao carregar clientes.</p>}>
        <Suspense fallback={<p>Carregando clientes...</p>}>
          <CustomersView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default CustomersPage;
