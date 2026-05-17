import type { CustomersInput } from "@/modules/customers/types";
import { customersSearchParamsSchema } from "@/modules/customers/validations";
import { PAGINATION } from "@/constants";

export type CustomersSearchParams = Record<
  string,
  string | string[] | undefined
>;

export const normalizeCustomersParams = (
  params: Partial<CustomersInput>,
): CustomersInput => ({
  page: params.page ?? PAGINATION.DEFAULT_PAGE,
  perPage: params.perPage ?? PAGINATION.DEFAULT_PER_PAGE,
  search: params.search || undefined,
  sortBy: params.sortBy ?? "createdAt",
  sortOrder: params.sortOrder ?? "desc",
  createdAtFrom: params.createdAtFrom || undefined,
  createdAtTo: params.createdAtTo || undefined,
});

export const parseCustomersSearchParams = (
  params: CustomersSearchParams,
): CustomersInput => {
  const result = customersSearchParamsSchema.safeParse(params);

  return normalizeCustomersParams(result.success ? result.data : {});
};
