import "server-only";

import { cacheByInput } from "@/lib/request-cache";
import type { StoreCategoriesInput } from "@/modules/categories/types";
import { caller } from "@/trpc/server";

const fetchStoreCategories = cacheByInput((input: StoreCategoriesInput) =>
  caller.categories.listStoreCategories(input),
);

export const getStoreCategories = async (input: StoreCategoriesInput = {}) =>
  fetchStoreCategories(input);
