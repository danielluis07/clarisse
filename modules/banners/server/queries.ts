import "server-only";

import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { banners, mediaAssets } from "@/db/schema";
import type { BannerRow } from "@/modules/banners/types";
import { unique } from "@/lib/utils";

export const bannerSelect = {
  id: banners.id,
  title: banners.title,
  subtitle: banners.subtitle,
  description: banners.description,
  imageId: banners.imageId,
  mobileImageId: banners.mobileImageId,
  ctaLabel: banners.ctaLabel,
  ctaUrl: banners.ctaUrl,
  placement: banners.placement,
  status: banners.status,
  focalX: banners.focalX,
  focalY: banners.focalY,
  mobileFocalX: banners.mobileFocalX,
  mobileFocalY: banners.mobileFocalY,
  createdAt: banners.createdAt,
  updatedAt: banners.updatedAt,
} as const;

export const mediaAssetSelect = {
  id: mediaAssets.id,
  url: mediaAssets.url,
  filename: mediaAssets.filename,
  altText: mediaAssets.altText,
  mimeType: mediaAssets.mimeType,
  width: mediaAssets.width,
  height: mediaAssets.height,
} as const;

export const getBannerMediaIds = (rows: BannerRow[]) =>
  unique(
    rows
      .flatMap((row) => [row.imageId, row.mobileImageId])
      .filter((id): id is string => !!id),
  );

export const withBannerImages = async <T extends BannerRow>(rows: T[]) => {
  const ids = getBannerMediaIds(rows);
  const imageRows = ids.length
    ? await db
        .select(mediaAssetSelect)
        .from(mediaAssets)
        .where(inArray(mediaAssets.id, ids))
    : [];
  const imagesById = new Map(imageRows.map((image) => [image.id, image]));

  return rows.map((row) => ({
    ...row,
    image: row.imageId ? (imagesById.get(row.imageId) ?? null) : null,
    mobileImage: row.mobileImageId
      ? (imagesById.get(row.mobileImageId) ?? null)
      : null,
  }));
};
