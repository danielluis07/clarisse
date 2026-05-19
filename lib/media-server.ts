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

export type DeletedMediaRow = {
  id: string;
  key: string | null;
  url: string;
};

/**
 * Database-only step: removes the `mediaAssets` rows and returns enough info
 * for a follow-up S3 purge. Accepts a Drizzle transaction handle so the caller
 * can compose the delete with sibling DB writes atomically — when the parent
 * entity (category, banner, etc.) is being deleted, both writes should
 * succeed or fail together.
 */
export const deleteMediaAssetRows = async (
  tx: Pick<typeof db, "select" | "delete">,
  ids: string[],
): Promise<DeletedMediaRow[]> => {
  if (!ids.length) return [];

  const rows = await tx
    .select({ id: mediaAssets.id, key: mediaAssets.key, url: mediaAssets.url })
    .from(mediaAssets)
    .where(inArray(mediaAssets.id, ids));

  if (!rows.length) return [];

  await tx.delete(mediaAssets).where(
    inArray(
      mediaAssets.id,
      rows.map((row) => row.id),
    ),
  );

  return rows;
};

/**
 * Best-effort S3 cleanup. Run AFTER the parent transaction has committed —
 * the DB rows are already gone, so a failure here just leaves an orphaned
 * S3 object (logged but never thrown).
 */
export const purgeMediaAssetsFromS3 = async (rows: DeletedMediaRow[]) => {
  if (!rows.length) return;

  await Promise.allSettled(
    rows.map(async (row) => {
      const key = row.key || parseS3KeyFromUrl(row.url);
      if (!key) return;
      try {
        await client.file(key).delete();
      } catch (error) {
        console.error(`Falha ao deletar ${key} no S3:`, error);
      }
    }),
  );
};

/**
 * Convenience wrapper: deletes rows + purges S3 in one call. Use when the
 * call site isn't already inside a transaction (e.g. the standalone
 * `media.deleteAsset` mutation). For composed deletes (e.g. removing a
 * category along with its image), call `deleteMediaAssetRows` inside a
 * `db.transaction(...)` and `purgeMediaAssetsFromS3` after it commits.
 */
export const deleteMediaAssetsByIds = async (ids: string[]) => {
  const rows = await deleteMediaAssetRows(db, ids);
  await purgeMediaAssetsFromS3(rows);
};
