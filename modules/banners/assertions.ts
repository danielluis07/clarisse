import "server-only";

import { TRPCError } from "@trpc/server";
import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { unique } from "@/lib/utils";

export const assertBannerImageAssetsExist = async (
  imageIds: Array<string | null | undefined>,
) => {
  const ids = unique(imageIds.filter((id): id is string => !!id));
  if (!ids.length) return;

  const rows = await db
    .select({ id: mediaAssets.id, type: mediaAssets.type })
    .from(mediaAssets)
    .where(inArray(mediaAssets.id, ids));
  const imageAssetIds = new Set(
    rows.filter((row) => row.type === "image").map((row) => row.id),
  );
  const missing = ids.filter((id) => !imageAssetIds.has(id));

  if (missing.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Imagens não encontradas: ${missing.join(", ")}`,
    });
  }
};

export const assertBannerDateRange = (
  startsAt: Date | null | undefined,
  endsAt: Date | null | undefined,
) => {
  if (startsAt && endsAt && endsAt < startsAt) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "`endsAt` deve ser maior ou igual a `startsAt`",
    });
  }
};
