import "server-only";

import { cacheByInput } from "@/lib/request-cache";
import type { StoreBannersInput } from "@/modules/banners/types";
import { caller } from "@/trpc/server";

const fetchStoreBanners = cacheByInput((input: StoreBannersInput) =>
  caller.banners.listStoreBanners(input),
);

export const getStoreBanners = async (input: StoreBannersInput = {}) =>
  fetchStoreBanners(input);

export const getStoreHeroBanner = async () => {
  const [banner] = await getStoreBanners({
    placement: "home_hero",
    limit: 1,
  });

  return banner ?? null;
};
