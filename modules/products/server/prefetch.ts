import "server-only";

import type {
  InventoryInput,
  ProductsInput,
  StoreProductsInput,
} from "@/modules/products/types";
import {
  normalizeInventoryParams,
  normalizeProductsParams,
  normalizeStoreProductsParams,
} from "@/modules/products/params";
import { prefetch, trpc } from "@/trpc/server";

export const prefetchProducts = async (params: Partial<ProductsInput>) => {
  return prefetch(
    trpc.products.list.queryOptions(normalizeProductsParams(params)),
  );
};

export const prefetchProduct = async (id: string) => {
  return prefetch(trpc.products.get.queryOptions({ id }));
};

export const prefetchStoreProduct = async (slug: string) => {
  return prefetch(trpc.products.getStoreProduct.queryOptions({ slug }));
};

export const prefetchStoreProducts = async (
  params: Partial<StoreProductsInput>,
) => {
  return prefetch(
    trpc.products.listStoreProducts.queryOptions(
      normalizeStoreProductsParams(params),
    ),
  );
};

export const prefetchStoreRelatedProducts = async (slug: string, limit = 4) => {
  return prefetch(
    trpc.products.getStoreRelatedProducts.queryOptions({ slug, limit }),
  );
};

export const prefetchProductFormOptions = async () => {
  return prefetch(trpc.products.formOptions.queryOptions());
};

export const prefetchInventory = async (params: Partial<InventoryInput>) => {
  return prefetch(
    trpc.products.inventoryList.queryOptions(normalizeInventoryParams(params)),
  );
};
