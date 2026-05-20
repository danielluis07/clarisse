import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { requireAdmin } from "@/lib/auth-utils";
import { ProductForm } from "@/modules/products/components/form/product-form";
import {
  prefetchProduct,
  prefetchProductFormOptions,
} from "@/modules/products/prefetch";
import { HydrateClient } from "@/trpc/server";

const EditProductPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  await requireAdmin();
  const { id } = await params;

  prefetchProduct(id);
  prefetchProductFormOptions();

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<p>Falha ao carregar produto.</p>}>
        <Suspense fallback={<p>Carregando produto...</p>}>
          <ProductForm id={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default EditProductPage;
