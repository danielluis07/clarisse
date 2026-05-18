import "server-only";

import { prefetch, trpc } from "@/trpc/server";
import type { CategoriesInput } from "@/modules/categories/types";
import { normalizeCategoriesParams } from "@/modules/categories/utils";

export const prefetchCategories = async (params: Partial<CategoriesInput>) => {
  return prefetch(
    trpc.categories.list.queryOptions(normalizeCategoriesParams(params)),
  );
};

export const prefetchCategory = async (id: string) => {
  return prefetch(trpc.categories.get.queryOptions({ id }));
};
