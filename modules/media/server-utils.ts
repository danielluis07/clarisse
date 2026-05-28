import "server-only";

import { inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  banners,
  categories,
  collections,
  productImages,
  storeSettings,
} from "@/db/schema";
import { unique } from "@/lib/array-utils";

/**
 * Get media asset IDs that are not referenced anywhere in the database.
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
