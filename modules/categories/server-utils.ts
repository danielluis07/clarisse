import "server-only";

import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

export const createCategorySlug = (name: string) => {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "categoria";
};

export const getUniqueCategorySlug = async (
  name: string,
  options: { excludeId?: string } = {},
) => {
  const baseSlug = createCategorySlug(name);
  let slug = baseSlug;
  let suffix = 2;

  while (await categorySlugExists(slug, options.excludeId)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

const categorySlugExists = async (slug: string, excludeId?: string) => {
  const conditions = [eq(categories.slug, slug)];

  if (excludeId) {
    conditions.push(ne(categories.id, excludeId));
  }

  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(...conditions))
    .limit(1);

  return Boolean(category);
};
