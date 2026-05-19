import "server-only";

import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema";

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
