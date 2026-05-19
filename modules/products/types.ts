import type { AppRouter, RouterOutput } from "@/trpc/routers/_app";
import type { inferRouterInputs } from "@trpc/server";

type RouterInput = inferRouterInputs<AppRouter>;

export type ProductsInput = RouterInput["products"]["list"];
export type ProductsOutput = RouterOutput["products"]["list"];
export type ProductListItem = ProductsOutput["data"][number];

export type ProductInput = RouterInput["products"]["get"];
export type ProductOutput = RouterOutput["products"]["get"];

export type CreateProductInput = RouterInput["products"]["create"];
export type UpdateProductInput = RouterInput["products"]["update"];
export type DeleteProductInput = RouterInput["products"]["delete"];

export type ProductVariantOutput = ProductOutput["variants"][number];
export type CreateProductVariantInput =
  RouterInput["products"]["createVariant"];
export type UpdateProductVariantInput =
  RouterInput["products"]["updateVariant"];
export type ReplaceProductVariantsInput =
  RouterInput["products"]["replaceVariants"];
export type DeleteProductVariantInput =
  RouterInput["products"]["deleteVariant"];

export type InventoryInput = RouterInput["products"]["inventoryList"];
export type InventoryOutput = RouterOutput["products"]["inventoryList"];
export type InventoryListItem = InventoryOutput["data"][number];
export type AdjustInventoryInput = RouterInput["products"]["adjustInventory"];

// Internal types used in router operations
export type ProductImagePayload = {
  mediaAssetId: string;
  variantId?: string | null;
  variantSku?: string | null;
  altText?: string | null;
  position?: number;
  isPrimary?: boolean;
};

export type ProductVariantPayload = {
  id?: string;
  sku: string;
  colorName: string;
  colorHex?: string | null;
  size: string;
  priceCents?: number | null;
  compareAtPriceCents?: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  weightGrams?: number | null;
  isActive: boolean;
  displayOrder?: number;
};
