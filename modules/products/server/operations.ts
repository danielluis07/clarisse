import "server-only";

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  productImages,
  productsToCollections,
  productVariants,
} from "@/db/schema";
import type {
  ProductImagePayload,
  ProductVariantPayload,
} from "@/modules/products/types";

type ProductVariantRef = {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string | null;
};

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
export const getVariantRefs = async (
  productId: string,
  source: Pick<typeof db, "select"> = db,
) => {
  const variants = await source
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      colorName: productVariants.colorName,
      colorHex: productVariants.colorHex,
    })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));
  const colorsByName = new Map<string, ProductVariantRef>();

  variants.forEach((variant) => {
    const colorKey = normalizeColorKey(variant.colorName);
    const existing = colorsByName.get(colorKey);

    if (!existing || (!existing.colorHex && variant.colorHex)) {
      colorsByName.set(colorKey, variant);
    }
  });

  return {
    byId: new Map(variants.map((variant) => [variant.id, variant])),
    bySku: new Map(variants.map((variant) => [variant.sku, variant])),
    colorsByName,
  };
};

const normalizeColorKey = (value: string) => value.trim().toLowerCase();

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
 * Resolve color metadata from an explicit image color or its legacy variant link
 */
export const resolveImageColor = (
  image: ProductImagePayload,
  refs: Awaited<ReturnType<typeof getVariantRefs>>,
) => {
  const variantById = image.variantId ? refs.byId.get(image.variantId) : null;
  const variantBySku = image.variantSku
    ? refs.bySku.get(image.variantSku)
    : null;
  const variant = variantById ?? variantBySku ?? null;
  const colorName = image.colorName?.trim() || variant?.colorName || null;

  if (!colorName) {
    if (image.colorHex) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Nome da cor da imagem é obrigatório quando o hex é informado",
      });
    }

    return { colorName: null, colorHex: null };
  }

  const color = refs.colorsByName.get(normalizeColorKey(colorName));

  if (!color) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cor de imagem não pertence ao produto: ${colorName}`,
    });
  }

  if (
    variant &&
    normalizeColorKey(variant.colorName) !== normalizeColorKey(color.colorName)
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "A imagem informa variante e cor conflitantes",
    });
  }

  return {
    colorName: color.colorName,
    colorHex: color.colorHex ?? image.colorHex ?? null,
  };
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
        ...resolveImageColor(image, refs),
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
