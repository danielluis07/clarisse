import { requireAdmin } from "@/lib/auth-utils";
import { BannersView } from "@/modules/banners/components/banners-view";
import { prefetchBanners } from "@/modules/banners/prefetch";
import { parseBannersSearchParams } from "@/modules/banners/utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const BannersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  await requireAdmin();
  const rawParams = await searchParams;
  const parsedParams = parseBannersSearchParams(rawParams);

  prefetchBanners(parsedParams);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<p>Falha ao carregar banners.</p>}>
        <Suspense fallback={<p>Carregando banners...</p>}>
          <BannersView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default BannersPage;
