import { requireAdmin } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { prefetchCategory } from "@/modules/categories/prefetch";
import { CategoryForm } from "@/modules/categories/components/category-form";

const EditCategoryPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  await requireAdmin();
  const { id } = await params;

  prefetchCategory(id);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<p>Falha ao carregar categoria.</p>}>
        <Suspense fallback={<p>Carregando categoria...</p>}>
          <CategoryForm id={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default EditCategoryPage;
