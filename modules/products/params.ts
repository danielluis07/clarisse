import { PAGINATION } from "@/constants";
import { STORE_PRODUCTS_PER_PAGE } from "@/modules/products/constants";
import type {
  InventoryInput,
  ProductsInput,
  StoreProductsInput,
} from "@/modules/products/types";
import {
  inventorySearchParamsSchema,
  productsSearchParamsSchema,
  storeProductsSearchParamsSchema,
} from "@/modules/products/validations";

export type ProductsSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type InventorySearchParams = Record<
  string,
  string | string[] | undefined
>;

export type StoreProductsSearchParams = Record<
  string,
  string | string[] | undefined
>;

export const normalizeProductsParams = (
  params: Partial<ProductsInput>,
): ProductsInput => ({
  page: params.page ?? PAGINATION.DEFAULT_PAGE,
  perPage: params.perPage ?? PAGINATION.DEFAULT_PER_PAGE,
  search: params.search || undefined,
  sortBy: params.sortBy ?? "createdAt",
  sortOrder: params.sortOrder ?? "desc",
  status: params.status || undefined,
  categoryId: params.categoryId || undefined,
  collectionId: params.collectionId || undefined,
  isFeatured:
    typeof params.isFeatured === "boolean" ? params.isFeatured : undefined,
  createdAtFrom: params.createdAtFrom || undefined,
  createdAtTo: params.createdAtTo || undefined,
});

export const parseProductsSearchParams = (
  params: ProductsSearchParams,
): ProductsInput => {
  const result = productsSearchParamsSchema.safeParse(params);

  return normalizeProductsParams(result.success ? result.data : {});
};

export const normalizeStoreProductsParams = (
  params: Partial<StoreProductsInput>,
): StoreProductsInput => ({
  page: params.page ?? PAGINATION.DEFAULT_PAGE,
  perPage: params.perPage ?? STORE_PRODUCTS_PER_PAGE,
  search: params.search || undefined,
  categoryId: params.categoryId || undefined,
  collectionSlug: params.collectionSlug || undefined,
  isFeatured:
    typeof params.isFeatured === "boolean" ? params.isFeatured : undefined,
  sortBy:
    params.sortBy === "createdAt" ||
    params.sortBy === "publishedAt" ||
    params.sortBy === "name" ||
    params.sortBy === "basePriceCents" ||
    params.sortBy === "random"
      ? params.sortBy
      : "publishedAt",
  sortOrder: params.sortOrder ?? "desc",
});

export const parseStoreProductsSearchParams = (
  params: StoreProductsSearchParams,
) => {
  const result = storeProductsSearchParamsSchema.safeParse(params);

  return normalizeStoreProductsParams(result.success ? result.data : {});
};

export const normalizeInventoryParams = (
  params: Partial<InventoryInput>,
): InventoryInput => ({
  page: params.page ?? PAGINATION.DEFAULT_PAGE,
  perPage: params.perPage ?? PAGINATION.DEFAULT_PER_PAGE,
  search: params.search || undefined,
  sortBy: params.sortBy ?? "updatedAt",
  sortOrder: params.sortOrder ?? "desc",
  productId: params.productId || undefined,
  categoryId: params.categoryId || undefined,
  status: params.status || undefined,
  isActive: typeof params.isActive === "boolean" ? params.isActive : undefined,
  stockStatus: params.stockStatus || undefined,
});

export const parseInventorySearchParams = (
  params: InventorySearchParams,
): InventoryInput => {
  const result = inventorySearchParamsSchema.safeParse(params);

  return normalizeInventoryParams(result.success ? result.data : {});
};
