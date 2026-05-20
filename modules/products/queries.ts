import "server-only";

import { productVariants, products } from "@/db/schema";

/**
 * Product select configuration for database queries
 */
export const productSelect = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  subtitle: products.subtitle,
  description: products.description,
  status: products.status,
  categoryId: products.categoryId,
  basePriceCents: products.basePriceCents,
  compareAtPriceCents: products.compareAtPriceCents,
  costCents: products.costCents,
  currency: products.currency,
  isFeatured: products.isFeatured,
  material: products.material,
  fit: products.fit,
  careInstructions: products.careInstructions,
  seoTitle: products.seoTitle,
  seoDescription: products.seoDescription,
  publishedAt: products.publishedAt,
  createdAt: products.createdAt,
  updatedAt: products.updatedAt,
} as const;

/**
 * Product variant select configuration for database queries
 */
export const productVariantSelect = {
  id: productVariants.id,
  productId: productVariants.productId,
  sku: productVariants.sku,
  colorName: productVariants.colorName,
  colorHex: productVariants.colorHex,
  size: productVariants.size,
  priceCents: productVariants.priceCents,
  compareAtPriceCents: productVariants.compareAtPriceCents,
  stockQuantity: productVariants.stockQuantity,
  lowStockThreshold: productVariants.lowStockThreshold,
  weightGrams: productVariants.weightGrams,
  isActive: productVariants.isActive,
  displayOrder: productVariants.displayOrder,
  createdAt: productVariants.createdAt,
  updatedAt: productVariants.updatedAt,
} as const;
