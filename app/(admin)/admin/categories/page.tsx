import { requireAdmin } from "@/lib/auth-utils";
import { CategoriesView } from "@/modules/categories/components/categories-view";
import { prefetchCategories } from "@/modules/categories/server/prefetch";
import { parseCategoriesSearchParams } from "@/modules/categories/params";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const CategoriesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  await requireAdmin();
  const rawParams = await searchParams;
  const parsedParams = parseCategoriesSearchParams(rawParams);

  prefetchCategories(parsedParams);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<p>Falha ao carregar categorias.</p>}>
        <Suspense fallback={<p>Carregando categorias...</p>}>
          <CategoriesView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default CategoriesPage;
