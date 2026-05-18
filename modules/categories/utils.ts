import type { CategoriesInput } from "@/modules/categories/types";
import { PAGINATION } from "@/constants";
import { categoriesSearchParamsSchema } from "@/modules/categories/validations";

export type CategoriesSearchParams = Record<
  string,
  string | string[] | undefined
>;

export const normalizeCategoriesParams = (
  params: Partial<CategoriesInput>,
): CategoriesInput => ({
  page: params.page ?? PAGINATION.DEFAULT_PAGE,
  perPage: params.perPage ?? PAGINATION.DEFAULT_PER_PAGE,
  search: params.search || undefined,
  sortBy: params.sortBy ?? "displayOrder",
  sortOrder: params.sortOrder ?? "asc",
  isActive:
    typeof params.isActive === "boolean" ? params.isActive : undefined,
  createdAtFrom: params.createdAtFrom || undefined,
  createdAtTo: params.createdAtTo || undefined,
});

export const parseCategoriesSearchParams = (
  params: CategoriesSearchParams,
): CategoriesInput => {
  const result = categoriesSearchParamsSchema.safeParse(params);

  return normalizeCategoriesParams(result.success ? result.data : {});
};
