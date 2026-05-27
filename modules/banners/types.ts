import type { AppRouter, RouterOutput } from "@/trpc/routers/_app";
import type { inferRouterInputs } from "@trpc/server";

type RouterInput = inferRouterInputs<AppRouter>;

export type BannersInput = RouterInput["banners"]["list"];
export type BannersOutput = RouterOutput["banners"]["list"];
export type BannerOutput = BannersOutput["data"][number];
export type BannerInput = RouterInput["banners"]["get"];
export type CreateBannerInput = RouterInput["banners"]["create"];
export type UpdateBannerInput = RouterInput["banners"]["update"];
export type DeleteBannerInput = RouterInput["banners"]["delete"];
export type StoreBannersInput = RouterInput["banners"]["listStoreBanners"];
export type StoreBannersOutput = RouterOutput["banners"]["listStoreBanners"];

export type BannerRow = {
  imageId: string | null;
  mobileImageId: string | null;
};
