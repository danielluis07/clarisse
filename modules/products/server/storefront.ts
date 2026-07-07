import "server-only";

import { cacheByInput } from "@/lib/request-cache";
import type { StoreProductsInput } from "@/modules/products/types";
import { normalizeStoreProductsParams } from "@/modules/products/params";
import { caller } from "@/trpc/server";

const fetchStoreProducts = cacheByInput((input: StoreProductsInput) =>
  caller.products.listStoreProducts(input),
);

export const getStoreProducts = async (
  input: Partial<StoreProductsInput> = {},
) => fetchStoreProducts(normalizeStoreProductsParams(input));
