import { requireAdmin } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CategoryForm } from "@/modules/categories/components/category-form";

const CreateCategoryPage = async () => {
  await requireAdmin();

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<p>Falha ao carregar categoria.</p>}>
        <Suspense fallback={<p>Carregando categoria...</p>}>
          <CategoryForm />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default CreateCategoryPage;
