import "server-only";

import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  banners,
  categories,
  collections,
  productImages,
  productsToCollections,
  productVariants,
  storeSettings,
} from "@/db/schema";
import type {
  ProductImagePayload,
  ProductVariantPayload,
} from "@/modules/products/types";
import { unique } from "@/modules/products/assertions";

/**
 * Normalize variant data for database insertion
 */
export const normalizeVariantValues = (
  productId: string,
  variant: ProductVariantPayload,
  index: number,
) => ({
  productId,
  sku: variant.sku,
  colorName: variant.colorName,
  colorHex: variant.colorHex ?? null,
  size: variant.size,
  priceCents: variant.priceCents ?? null,
  compareAtPriceCents: variant.compareAtPriceCents ?? null,
  stockQuantity: variant.stockQuantity,
  lowStockThreshold: variant.lowStockThreshold,
  weightGrams: variant.weightGrams ?? null,
  isActive: variant.isActive,
  displayOrder: variant.displayOrder ?? index,
});

/**
 * Normalize images by setting positions and determining primary image
 */
export const normalizeImages = (images: ProductImagePayload[]) => {
  if (!images.length) return [];

  const primaryIndex = images.findIndex((image) => image.isPrimary);

  return images.map((image, index) => ({
    ...image,
    position: image.position ?? index,
    isPrimary: primaryIndex >= 0 ? index === primaryIndex : index === 0,
  }));
};

/**
 * Get variant references mapped by ID and SKU
 */
export const getVariantRefs = async (productId: string) => {
  const variants = await db
    .select({ id: productVariants.id, sku: productVariants.sku })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  return {
    byId: new Map(variants.map((variant) => [variant.id, variant])),
    bySku: new Map(variants.map((variant) => [variant.sku, variant])),
  };
};

/**
 * Resolve variant ID from image payload using variant ID or SKU
 */
export const resolveImageVariantId = (
  image: ProductImagePayload,
  refs: Awaited<ReturnType<typeof getVariantRefs>>,
) => {
  const variantById = image.variantId ? refs.byId.get(image.variantId) : null;
  const variantBySku = image.variantSku
    ? refs.bySku.get(image.variantSku)
    : null;

  if (image.variantId && !variantById) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Variante de imagem não pertence ao produto",
    });
  }

  if (image.variantSku && !variantBySku) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `SKU de imagem não pertence ao produto: ${image.variantSku}`,
    });
  }

  if (variantById && variantBySku && variantById.id !== variantBySku.id) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "A imagem informa variante e SKU conflitantes",
    });
  }

  return variantById?.id ?? variantBySku?.id ?? null;
};

/**
 * Get media asset IDs that are not referenced anywhere in the database
 */
export const getUnusedMediaAssetIds = async (
  tx: Pick<typeof db, "select">,
  mediaIds: string[],
) => {
  const ids = unique(mediaIds);
  if (!ids.length) return [];

  const referenced = new Set<string>();

  const productImageRefs = await tx
    .select({ id: productImages.mediaAssetId })
    .from(productImages)
    .where(inArray(productImages.mediaAssetId, ids));
  productImageRefs.forEach((row) => referenced.add(row.id));

  const categoryRefs = await tx
    .select({ id: categories.imageId })
    .from(categories)
    .where(inArray(categories.imageId, ids));
  categoryRefs.forEach((row) => {
    if (row.id) referenced.add(row.id);
  });

  const collectionRefs = await tx
    .select({ id: collections.imageId })
    .from(collections)
    .where(inArray(collections.imageId, ids));
  collectionRefs.forEach((row) => {
    if (row.id) referenced.add(row.id);
  });

  const bannerImageRefs = await tx
    .select({ id: banners.imageId })
    .from(banners)
    .where(inArray(banners.imageId, ids));
  bannerImageRefs.forEach((row) => {
    if (row.id) referenced.add(row.id);
  });

  const bannerMobileImageRefs = await tx
    .select({ id: banners.mobileImageId })
    .from(banners)
    .where(inArray(banners.mobileImageId, ids));
  bannerMobileImageRefs.forEach((row) => {
    if (row.id) referenced.add(row.id);
  });

  const logoRefs = await tx
    .select({ id: storeSettings.logoId })
    .from(storeSettings)
    .where(inArray(storeSettings.logoId, ids));
  logoRefs.forEach((row) => {
    if (row.id) referenced.add(row.id);
  });

  return ids.filter((id) => !referenced.has(id));
};

/**
 * Insert product-collection relationships
 */
export const insertProductCollections = async (
  tx: Pick<typeof db, "insert">,
  productId: string,
  collectionIds: string[],
) => {
  if (!collectionIds.length) return [];

  return tx
    .insert(productsToCollections)
    .values(
      collectionIds.map((collectionId, index) => ({
        productId,
        collectionId,
        displayOrder: index,
      })),
    )
    .returning();
};

/**
 * Insert product images with variant associations
 */
export const insertProductImages = async (
  tx: Pick<typeof db, "insert">,
  productId: string,
  images: ProductImagePayload[],
  refs: Awaited<ReturnType<typeof getVariantRefs>>,
) => {
  const normalized = normalizeImages(images);
  if (!normalized.length) return [];

  return tx
    .insert(productImages)
    .values(
      normalized.map((image) => ({
        productId,
        mediaAssetId: image.mediaAssetId,
        variantId: resolveImageVariantId(image, refs),
        altText: image.altText ?? null,
        position: image.position,
        isPrimary: image.isPrimary,
      })),
    )
    .returning();
};

/**
 * Map product row with category information
 */
export const mapProductRow = <
  T extends { categoryName: string | null } & Record<string, unknown>,
>(
  row: T & {
    categoryId: string | null;
    categorySlug: string | null;
  },
) => {
  const { categoryName, categorySlug, ...product } = row;

  return {
    ...product,
    category: categoryName
      ? {
          id: row.categoryId,
          name: categoryName,
          slug: categorySlug,
        }
      : null,
  };
};
