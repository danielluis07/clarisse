import "server-only";

import type { StoreCategoriesInput } from "@/modules/categories/types";
import { getQueryClient, trpc } from "@/trpc/server";

export const getStoreCategories = async (
  input: StoreCategoriesInput = {},
) => {
  return getQueryClient().fetchQuery(
    trpc.categories.listStoreCategories.queryOptions(input),
  );
};
