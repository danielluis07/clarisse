import "server-only";

import { prefetch, trpc } from "@/trpc/server";

export const prefetchBanner = async (id: string) => {
  return prefetch(trpc.banners.get.queryOptions({ id }));
};
