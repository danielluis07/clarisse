import "server-only";

import type { StoreProductsInput } from "@/modules/products/types";
import { normalizeStoreProductsParams } from "@/modules/products/utils";
import { getQueryClient, trpc } from "@/trpc/server";

export const getStoreProducts = async (
  input: Partial<StoreProductsInput> = {},
) => {
  return getQueryClient().fetchQuery(
    trpc.products.listStoreProducts.queryOptions(
      normalizeStoreProductsParams(input),
    ),
  );
};
