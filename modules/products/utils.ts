import { PAGINATION } from "@/constants";
import type { InventoryInput, ProductsInput } from "@/modules/products/types";
import {
  inventorySearchParamsSchema,
  productsSearchParamsSchema,
} from "@/modules/products/validations";

export type ProductsSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type InventorySearchParams = Record<
  string,
  string | string[] | undefined
>;

export type VariantStockState = "in_stock" | "low_stock" | "out_of_stock";

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
  isActive:
    typeof params.isActive === "boolean" ? params.isActive : undefined,
  stockStatus: params.stockStatus || undefined,
});

export const parseInventorySearchParams = (
  params: InventorySearchParams,
): InventoryInput => {
  const result = inventorySearchParamsSchema.safeParse(params);

  return normalizeInventoryParams(result.success ? result.data : {});
};

export const getVariantStockState = (
  stockQuantity: number,
  lowStockThreshold: number,
): VariantStockState => {
  if (stockQuantity <= 0) return "out_of_stock";
  if (stockQuantity <= lowStockThreshold) return "low_stock";
  return "in_stock";
};

export const getProductStatusLabel = (
  status: "draft" | "active" | "archived",
) => {
  const labels = {
    draft: "Rascunho",
    active: "Ativo",
    archived: "Arquivado",
  } as const;

  return labels[status];
};

export const getStockStatusLabel = (status: VariantStockState) => {
  const labels = {
    in_stock: "Em estoque",
    low_stock: "Estoque baixo",
    out_of_stock: "Sem estoque",
  } as const;

  return labels[status];
};

export const buildVariantLabel = ({
  colorName,
  size,
}: {
  colorName: string;
  size: string;
}) => {
  if (colorName === "Default" && size === "One Size") return "Padrão";
  if (size === "One Size") return colorName;
  if (colorName === "Default") return size;
  return `${colorName} / ${size}`;
};
