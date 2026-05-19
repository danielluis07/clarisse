import "server-only";

import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { client } from "@/lib/s3";

export const parseS3KeyFromUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const expectedHost = `${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
    if (parsed.host !== expectedHost) return null;
    const key = parsed.pathname.replace(/^\//, "");
    return key || null;
  } catch {
    return null;
  }
};

/**
 * Deletes media assets from both S3 and the `mediaAssets` table.
 *
 * S3 deletion is best-effort: a failure to delete the object does NOT prevent
 * the DB row from being removed, because the DB row is what other tables
 * (categories, banners, products) reference. Leaving a row pointing at a
 * missing S3 object would be worse than the inverse.
 */
export const deleteMediaAssetsByIds = async (ids: string[]) => {
  if (!ids.length) return;

  const assets = await db
    .select({
      id: mediaAssets.id,
      key: mediaAssets.key,
      url: mediaAssets.url,
    })
    .from(mediaAssets)
    .where(inArray(mediaAssets.id, ids));

  if (!assets.length) return;

  await Promise.allSettled(
    assets.map(async (asset) => {
      const key = asset.key || parseS3KeyFromUrl(asset.url);
      if (!key) return;
      try {
        await client.file(key).delete();
      } catch (error) {
        console.error(`Falha ao deletar ${key} no S3:`, error);
      }
    }),
  );

  await db
    .delete(mediaAssets)
    .where(inArray(mediaAssets.id, assets.map((asset) => asset.id)));
};
