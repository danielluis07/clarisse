import "server-only";

import { and, asc, desc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { categories, collections, products } from "@/db/schema";
import type { ProductAiCatalogOptions } from "@/modules/products/types";

export const createProductSlug = (name: string) => {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "produto";
};

export const getUniqueProductSlug = async (
  name: string,
  options: { excludeId?: string } = {},
) => {
  const baseSlug = createProductSlug(name);
  let slug = baseSlug;
  let suffix = 2;

  while (await productSlugExists(slug, options.excludeId)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

const productSlugExists = async (slug: string, excludeId?: string) => {
  const conditions = [eq(products.slug, slug)];

  if (excludeId) {
    conditions.push(ne(products.id, excludeId));
  }

  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(...conditions))
    .limit(1);

  return Boolean(product);
};

const DEFAULT_MODEL = "gpt-5.4-mini";

export const getOpenAIModel = () =>
  process.env.OPENAI_CHAT_MODEL?.trim() || DEFAULT_MODEL;

export const getCatalogOptions = async (): Promise<ProductAiCatalogOptions> => {
  const [categoryOptions, collectionOptions] = await Promise.all([
    db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.displayOrder), asc(categories.name)),
    db
      .select({
        id: collections.id,
        name: collections.name,
        description: collections.description,
        isFeatured: collections.isFeatured,
      })
      .from(collections)
      .where(eq(collections.isActive, true))
      .orderBy(
        desc(collections.isFeatured),
        asc(collections.displayOrder),
        asc(collections.name),
      ),
  ]);

  return {
    categories: categoryOptions,
    collections: collectionOptions,
  };
};
