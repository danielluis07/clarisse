import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { requireAdmin } from "@/lib/auth-utils";
import { ProductsView } from "@/modules/products/components/products-view";
import {
  prefetchProductFormOptions,
  prefetchProducts,
} from "@/modules/products/prefetch";
import { parseProductsSearchParams } from "@/modules/products/utils";
import { HydrateClient } from "@/trpc/server";

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  await requireAdmin();
  const rawParams = await searchParams;
  const parsedParams = parseProductsSearchParams(rawParams);

  prefetchProducts(parsedParams);
  prefetchProductFormOptions();

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<p>Falha ao carregar produtos.</p>}>
        <Suspense fallback={<p>Carregando produtos...</p>}>
          <ProductsView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default ProductsPage;
