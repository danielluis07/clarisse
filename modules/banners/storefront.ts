import "server-only";

import type { StoreBannersInput } from "@/modules/banners/types";
import { getQueryClient, trpc } from "@/trpc/server";

export const getStoreBanners = async (input: StoreBannersInput = {}) => {
  return getQueryClient().fetchQuery(
    trpc.banners.listStoreBanners.queryOptions(input),
  );
};

export const getStoreHeroBanner = async () => {
  const [banner] = await getStoreBanners({
    placement: "home_hero",
    limit: 1,
  });

  return banner ?? null;
};
