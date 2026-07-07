import { requireAdmin } from "@/lib/auth-utils";
import { BannerForm } from "@/modules/banners/components/banner-form";
import { prefetchBanner } from "@/modules/banners/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const EditBannerPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  await requireAdmin();
  const { id } = await params;

  prefetchBanner(id);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<p>Falha ao carregar banner.</p>}>
        <Suspense fallback={<p>Carregando banner...</p>}>
          <BannerForm id={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default EditBannerPage;
