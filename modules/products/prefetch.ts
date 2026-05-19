import "server-only";

import type { InventoryInput, ProductsInput } from "@/modules/products/types";
import {
  normalizeInventoryParams,
  normalizeProductsParams,
} from "@/modules/products/utils";
import { prefetch, trpc } from "@/trpc/server";

export const prefetchProducts = async (params: Partial<ProductsInput>) => {
  return prefetch(
    trpc.products.list.queryOptions(normalizeProductsParams(params)),
  );
};

export const prefetchProduct = async (id: string) => {
  return prefetch(trpc.products.get.queryOptions({ id }));
};

export const prefetchInventory = async (params: Partial<InventoryInput>) => {
  return prefetch(
    trpc.products.inventoryList.queryOptions(normalizeInventoryParams(params)),
  );
};
