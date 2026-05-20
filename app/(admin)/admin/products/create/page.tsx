import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { requireAdmin } from "@/lib/auth-utils";
import { ProductForm } from "@/modules/products/components/form/product-form";
import { prefetchProductFormOptions } from "@/modules/products/prefetch";
import { HydrateClient } from "@/trpc/server";

const CreateProductPage = async () => {
  await requireAdmin();

  prefetchProductFormOptions();

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<p>Falha ao carregar produto.</p>}>
        <Suspense fallback={<p>Carregando produto...</p>}>
          <ProductForm />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default CreateProductPage;
