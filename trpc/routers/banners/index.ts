import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  or,
} from "drizzle-orm";

import { db } from "@/db";
import { banners } from "@/db/schema";
import { escapeLikeWildcards } from "@/lib/db-utils";
import {
  deleteMediaAssetRows,
  purgeMediaAssetsFromS3,
} from "@/lib/media-server";
import {
  assertBannerDateRange,
  assertBannerImageAssetsExist,
} from "@/modules/banners/assertions";
import { rethrowBannerWriteError } from "@/modules/banners/errors";
import {
  bannerSelect,
  getBannerMediaIds,
  withBannerImages,
} from "@/modules/banners/server-utils";
import {
  createBannerInput,
  deleteBannerInput,
  deleteBannersInput,
  getBannerInput,
  listBannersInput,
  listStoreBannersInput,
  updateBannerInput,
} from "@/modules/banners/validations";
import { getUnusedMediaAssetIds } from "@/modules/media/server-utils";
import { adminProcedure, baseProcedure, createTRPCRouter } from "@/trpc/init";

export const bannersRouter = createTRPCRouter({
  list: adminProcedure.input(listBannersInput).query(async ({ input }) => {
    const {
      page,
      perPage,
      search,
      sortBy,
      sortOrder,
      placement,
      status,
      createdAtFrom,
      createdAtTo,
    } = input;
    const offset = (page - 1) * perPage;
    const conditions = [];

    if (search) {
      const escapedSearch = escapeLikeWildcards(search);
      const searchCondition = or(
        ilike(banners.title, `%${escapedSearch}%`),
        ilike(banners.subtitle, `%${escapedSearch}%`),
        ilike(banners.description, `%${escapedSearch}%`),
        ilike(banners.ctaLabel, `%${escapedSearch}%`),
        ilike(banners.ctaUrl, `%${escapedSearch}%`),
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    if (placement) conditions.push(eq(banners.placement, placement));
    if (status) conditions.push(eq(banners.status, status));
    if (createdAtFrom) {
      conditions.push(gte(banners.createdAt, new Date(createdAtFrom)));
    }
    if (createdAtTo) {
      conditions.push(lte(banners.createdAt, new Date(createdAtTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const orderByColumn = {
      createdAt: banners.createdAt,
      updatedAt: banners.updatedAt,
      title: banners.title,
      placement: banners.placement,
      status: banners.status,
      displayOrder: banners.displayOrder,
      startsAt: banners.startsAt,
      endsAt: banners.endsAt,
    }[sortBy];
    const orderBy =
      sortOrder === "asc"
        ? [asc(orderByColumn), asc(banners.id)]
        : [desc(orderByColumn), desc(banners.id)];

    const [rows, total] = await Promise.all([
      db
        .select(bannerSelect)
        .from(banners)
        .where(whereClause)
        .orderBy(...orderBy)
        .limit(perPage)
        .offset(offset),
      db
        .select({ count: count() })
        .from(banners)
        .where(whereClause)
        .then(([result]) => result?.count ?? 0),
    ]);

    return {
      data: await withBannerImages(rows),
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }),

  listStoreBanners: baseProcedure
    .input(listStoreBannersInput)
    .query(async ({ input }) => {
      const activeAt = input.at ?? new Date();
      const conditions = [eq(banners.status, "active")];
      const startsAtCondition = or(
        isNull(banners.startsAt),
        lte(banners.startsAt, activeAt),
      );
      const endsAtCondition = or(
        isNull(banners.endsAt),
        gte(banners.endsAt, activeAt),
      );

      if (input.placement) {
        conditions.push(eq(banners.placement, input.placement));
      }
      if (startsAtCondition) conditions.push(startsAtCondition);
      if (endsAtCondition) conditions.push(endsAtCondition);

      const rows = await db
        .select(bannerSelect)
        .from(banners)
        .where(and(...conditions))
        .orderBy(asc(banners.displayOrder), asc(banners.id));

      return withBannerImages(rows);
    }),

  get: adminProcedure.input(getBannerInput).query(async ({ input }) => {
    const [row] = await db
      .select(bannerSelect)
      .from(banners)
      .where(eq(banners.id, input.id))
      .limit(1);

    if (!row) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Banner não encontrado",
      });
    }

    const [data] = await withBannerImages([row]);
    return data;
  }),

  create: adminProcedure
    .input(createBannerInput)
    .mutation(async ({ input }) => {
      await assertBannerImageAssetsExist([input.imageId, input.mobileImageId]);

      try {
        const [row] = await db
          .insert(banners)
          .values({
            title: input.title,
            subtitle: input.subtitle ?? null,
            description: input.description ?? null,
            imageId: input.imageId ?? null,
            mobileImageId: input.mobileImageId ?? null,
            ctaLabel: input.ctaLabel ?? null,
            ctaUrl: input.ctaUrl ?? null,
            placement: input.placement,
            status: input.status,
            displayOrder: input.displayOrder,
            startsAt: input.startsAt ?? null,
            endsAt: input.endsAt ?? null,
          })
          .returning(bannerSelect);

        if (!row) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível criar o banner",
          });
        }

        const [data] = await withBannerImages([row]);
        return data;
      } catch (error) {
        return rethrowBannerWriteError(error, "Erro ao criar banner");
      }
    }),

  update: adminProcedure
    .input(updateBannerInput)
    .mutation(async ({ input }) => {
      const { id, ...values } = input;

      const [existing] = await db
        .select(bannerSelect)
        .from(banners)
        .where(eq(banners.id, id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Banner não encontrado",
        });
      }

      await assertBannerImageAssetsExist([
        values.imageId,
        values.mobileImageId,
      ]);

      const nextStartsAt =
        values.startsAt === undefined ? existing.startsAt : values.startsAt;
      const nextEndsAt =
        values.endsAt === undefined ? existing.endsAt : values.endsAt;
      assertBannerDateRange(nextStartsAt, nextEndsAt);

      const updateValues = {
        ...(values.title !== undefined ? { title: values.title } : {}),
        ...(values.subtitle !== undefined ? { subtitle: values.subtitle } : {}),
        ...(values.description !== undefined
          ? { description: values.description }
          : {}),
        ...(values.imageId !== undefined ? { imageId: values.imageId } : {}),
        ...(values.mobileImageId !== undefined
          ? { mobileImageId: values.mobileImageId }
          : {}),
        ...(values.ctaLabel !== undefined ? { ctaLabel: values.ctaLabel } : {}),
        ...(values.ctaUrl !== undefined ? { ctaUrl: values.ctaUrl } : {}),
        ...(values.placement !== undefined
          ? { placement: values.placement }
          : {}),
        ...(values.status !== undefined ? { status: values.status } : {}),
        ...(values.displayOrder !== undefined
          ? { displayOrder: values.displayOrder }
          : {}),
        ...(values.startsAt !== undefined ? { startsAt: values.startsAt } : {}),
        ...(values.endsAt !== undefined ? { endsAt: values.endsAt } : {}),
      };

      if (!Object.keys(updateValues).length) {
        const [data] = await withBannerImages([existing]);
        return data;
      }

      try {
        const [row] = await db
          .update(banners)
          .set(updateValues)
          .where(eq(banners.id, id))
          .returning(bannerSelect);

        if (!row) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Banner não encontrado",
          });
        }

        const [data] = await withBannerImages([row]);
        return data;
      } catch (error) {
        return rethrowBannerWriteError(error, "Erro ao atualizar banner");
      }
    }),

  delete: adminProcedure
    .input(deleteBannerInput)
    .mutation(async ({ input }) => {
      const { row, deletedMediaRows } = await db.transaction(async (tx) => {
        const [row] = await tx
          .delete(banners)
          .where(eq(banners.id, input.id))
          .returning(bannerSelect);

        if (!row) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Banner não encontrado",
          });
        }

        const unusedMediaIds = await getUnusedMediaAssetIds(
          tx,
          getBannerMediaIds([row]),
        );
        const deletedMediaRows = await deleteMediaAssetRows(tx, unusedMediaIds);

        return { row, deletedMediaRows };
      });

      await purgeMediaAssetsFromS3(deletedMediaRows);

      return row;
    }),

  deleteMany: adminProcedure
    .input(deleteBannersInput)
    .mutation(async ({ input }) => {
      const { rows, deletedMediaRows } = await db.transaction(async (tx) => {
        const rows = await tx
          .delete(banners)
          .where(inArray(banners.id, input.ids))
          .returning(bannerSelect);

        if (!rows.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Banners não encontrados",
          });
        }

        const unusedMediaIds = await getUnusedMediaAssetIds(
          tx,
          getBannerMediaIds(rows),
        );
        const deletedMediaRows = await deleteMediaAssetRows(tx, unusedMediaIds);

        return { rows, deletedMediaRows };
      });

      await purgeMediaAssetsFromS3(deletedMediaRows);

      return rows;
    }),
});
