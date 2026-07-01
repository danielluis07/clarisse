import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { requireAdmin } from "@/lib/auth-utils";
import { ShippingSettingsView } from "@/modules/shipping/components/shipping-settings-view";
import { prefetchShippingSettings } from "@/modules/shipping/prefetch";
import { HydrateClient } from "@/trpc/server";

const ShippingSettingsPage = async () => {
  await requireAdmin();

  prefetchShippingSettings();

  return (
    <HydrateClient>
      <ErrorBoundary
        fallback={<p>Falha ao carregar as configurações de envio.</p>}>
        <Suspense fallback={<p>Carregando configurações de envio...</p>}>
          <ShippingSettingsView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default ShippingSettingsPage;
