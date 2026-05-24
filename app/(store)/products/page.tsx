import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ProductsGrid } from "@/components/store/products/products-grid";
import {
  ProductsGridError,
  ProductsGridSkeleton,
} from "@/components/store/products/products-grid-skeleton";
import { prefetchStoreProducts } from "@/modules/products/prefetch";
import { parseStoreProductsSearchParams } from "@/modules/products/utils";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Produtos | Clarisse",
  description:
    "Explore o catálogo Clarisse de moda feminina premium: alfaiataria, vestidos minimalistas, camisas, bolsas e básicos sofisticados.",
};

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const rawParams = await searchParams;
  const parsedParams = parseStoreProductsSearchParams(rawParams);

  prefetchStoreProducts(parsedParams);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<ProductsGridError />}>
        <Suspense fallback={<ProductsGridSkeleton />}>
          <ProductsGrid />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default ProductsPage;
