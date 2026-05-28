import "server-only";

import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { categories, collections, mediaAssets, products } from "@/db/schema";
import type { ProductImagePayload } from "@/modules/products/types";
import { unique } from "@/lib/array-utils";

/**
 * Assert that a category exists
 */
export const assertCategoryExists = async (categoryId?: string | null) => {
  if (!categoryId) return;

  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!category) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Categoria informada não existe",
    });
  }
};

/**
 * Assert that all provided collections exist
 */
export const assertCollectionsExist = async (collectionIds: string[]) => {
  const ids = unique(collectionIds);
  if (!ids.length) return;

  const rows = await db
    .select({ id: collections.id })
    .from(collections)
    .where(inArray(collections.id, ids));
  const foundIds = new Set(rows.map((row) => row.id));
  const missing = ids.filter((id) => !foundIds.has(id));

  if (missing.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Coleções não encontradas: ${missing.join(", ")}`,
    });
  }
};

/**
 * Assert that all provided image assets exist
 */
export const assertImageAssetsExist = async (images: ProductImagePayload[]) => {
  const ids = unique(images.map((image) => image.mediaAssetId));
  if (!ids.length) return;

  const rows = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(inArray(mediaAssets.id, ids));
  const foundIds = new Set(rows.map((row) => row.id));
  const missing = ids.filter((id) => !foundIds.has(id));

  if (missing.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Imagens não encontradas: ${missing.join(", ")}`,
    });
  }
};

/**
 * Assert that a product exists
 */
export const assertProductExists = async (productId: string) => {
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Produto não encontrado",
    });
  }
};
