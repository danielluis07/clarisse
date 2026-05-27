import { requireAdmin } from "@/lib/auth-utils";
import { BannerForm } from "@/modules/banners/components/banner-form";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const CreateBannerPage = async () => {
  await requireAdmin();

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<p>Falha ao carregar banner.</p>}>
        <Suspense fallback={<p>Carregando banner...</p>}>
          <BannerForm />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default CreateBannerPage;
