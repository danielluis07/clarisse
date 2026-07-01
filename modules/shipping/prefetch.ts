import "server-only";

import { prefetch, trpc } from "@/trpc/server";

export const prefetchShippingSettings = () => {
  return prefetch(trpc.shipping.getSettings.queryOptions());
};
