import "server-only";

import type { BannersInput } from "@/modules/banners/types";
import { normalizeBannersParams } from "@/modules/banners/params";
import { prefetch, trpc } from "@/trpc/server";

export const prefetchBanners = async (params: Partial<BannersInput>) => {
  return prefetch(
    trpc.banners.list.queryOptions(normalizeBannersParams(params)),
  );
};

export const prefetchBanner = async (id: string) => {
  return prefetch(trpc.banners.get.queryOptions({ id }));
};
