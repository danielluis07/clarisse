import { PAGINATION } from "@/constants";
import type { BannersInput } from "@/modules/banners/types";
import { bannersSearchParamsSchema } from "@/modules/banners/validations";

export type BannersSearchParams = Record<string, string | string[] | undefined>;

export const normalizeBannersParams = (
  params: Partial<BannersInput>,
): BannersInput => ({
  page: params.page ?? PAGINATION.DEFAULT_PAGE,
  perPage: params.perPage ?? PAGINATION.DEFAULT_PER_PAGE,
  search: params.search || undefined,
  sortBy: params.sortBy ?? "updatedAt",
  sortOrder: params.sortOrder ?? "desc",
  placement: params.placement,
  status: params.status,
  createdAtFrom: params.createdAtFrom || undefined,
  createdAtTo: params.createdAtTo || undefined,
});

export const parseBannersSearchParams = (
  params: BannersSearchParams,
): BannersInput => {
  const result = bannersSearchParamsSchema.safeParse(params);

  return normalizeBannersParams(result.success ? result.data : {});
};
