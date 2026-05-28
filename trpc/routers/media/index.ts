import { TRPCError } from "@trpc/server";
import { and, eq, inArray, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import {
  deleteMediaAssetRows,
  deleteMediaAssetsByIds,
  parseS3KeyFromUrl,
  purgeMediaAssetsFromS3,
} from "@/lib/media-server";
import { client } from "@/lib/s3";
import {
  TEMPORARY_MEDIA_TTL_MS,
  TEMPORARY_PRODUCT_IMAGE_ANALYSIS_PURPOSE,
} from "@/modules/media/constants";
import { getUnusedMediaAssetIds } from "@/modules/media/server-utils";
import {
  createPresignedUploadInput,
  deleteAssetInput,
  getAssetInput,
  getAssetsByIdsInput,
  registerAssetInput,
} from "@/modules/media/validations";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";
import { sanitizeFilename } from "@/modules/media/utils";

const buildPublicUrl = (key: string) =>
  `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

export const mediaRouter = createTRPCRouter({
  getById: adminProcedure.input(getAssetInput).query(async ({ input }) => {
    const [asset] = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, input.id));

    if (!asset) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Asset não encontrado",
      });
    }

    return asset;
  }),

  getByIds: adminProcedure
    .input(getAssetsByIdsInput)
    .query(async ({ input }) => {
      if (!input.ids.length) return [];
      return db
        .select()
        .from(mediaAssets)
        .where(inArray(mediaAssets.id, input.ids));
    }),

  createPresignedUpload: adminProcedure
    .input(createPresignedUploadInput)
    .mutation(async ({ input }) => {
      const sanitized = sanitizeFilename(input.filename);
      const key = `${input.folder}/${crypto.randomUUID()}-${sanitized}`;

      try {
        const uploadUrl = client.file(key).presign({
          method: "PUT",
          expiresIn: 3600,
          type: input.mimeType,
        });

        return {
          uploadUrl,
          key,
          publicUrl: buildPublicUrl(key),
        };
      } catch (error) {
        console.error("Erro ao gerar URL de upload:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível gerar a URL de upload",
        });
      }
    }),

  registerAsset: adminProcedure
    .input(registerAssetInput)
    .mutation(async ({ ctx, input }) => {
      const key = parseS3KeyFromUrl(input.url);

      if (!key) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "URL não pertence ao bucket configurado",
        });
      }

      const [asset] = await db
        .insert(mediaAssets)
        .values({
          key,
          url: input.url,
          bucket: process.env.AWS_BUCKET_NAME ?? null,
          filename: input.filename,
          mimeType: input.mimeType,
          type: "image",
          sizeBytes: input.sizeBytes,
          width: input.width ?? null,
          height: input.height ?? null,
          altText: input.altText ?? null,
          metadata: input.metadata ?? null,
          createdById: ctx.adminId,
        })
        .returning();

      if (!asset) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível registrar o asset",
        });
      }

      return asset;
    }),

  cleanupExpiredTemporaryAssets: adminProcedure.mutation(async () => {
    try {
      const expiresBefore = new Date(Date.now() - TEMPORARY_MEDIA_TTL_MS);
      const deletedMediaRows = await db.transaction(async (tx) => {
        const candidates = await tx
          .select({ id: mediaAssets.id })
          .from(mediaAssets)
          .where(
            and(
              sql`${mediaAssets.metadata}->>'temporary' = 'true'`,
              sql`${mediaAssets.metadata}->>'purpose' = ${TEMPORARY_PRODUCT_IMAGE_ANALYSIS_PURPOSE}`,
              lt(mediaAssets.createdAt, expiresBefore),
            ),
          )
          .limit(100);

        const unusedMediaIds = await getUnusedMediaAssetIds(
          tx,
          candidates.map((candidate) => candidate.id),
        );

        return deleteMediaAssetRows(tx, unusedMediaIds);
      });

      await purgeMediaAssetsFromS3(deletedMediaRows);

      return { deletedCount: deletedMediaRows.length };
    } catch (error) {
      console.error("Erro ao limpar assets temporários:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Não foi possível limpar assets temporários expirados",
      });
    }
  }),

  deleteAsset: adminProcedure
    .input(deleteAssetInput)
    .mutation(async ({ input }) => {
      try {
        await deleteMediaAssetsByIds([input.id]);
      } catch (error) {
        console.error("Erro ao limpar asset:", error);
        // Make cleanup failures non-fatal for the client — the asset
        // deletion is best-effort for S3 and DB cleanup; return the id
        // so the UI can continue, retries can be attempted by the user.
      }

      return { id: input.id };
    }),
});
