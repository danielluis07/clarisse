import { db } from "@/db";
import { categories } from "@/db/schema";
import { escapeLikeWildcards } from "@/lib/db-utils";
import {
  deleteMediaAssetRows,
  purgeMediaAssetsFromS3,
} from "@/lib/media-server";
import { getUnusedMediaAssetIds } from "@/modules/media/server-utils";
import {
  createCategoryInput,
  deleteCategoryInput,
  getCategoryInput,
  listCategoriesInput,
  updateCategoryInput,
} from "@/modules/categories/validations";
import { getUniqueCategorySlug } from "@/modules/categories/server-utils";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";
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
  lte,
  or,
} from "drizzle-orm";
import { z } from "zod";

const categorySelect = {
  id: categories.id,
  name: categories.name,
  slug: categories.slug,
  description: categories.description,
  imageId: categories.imageId,
  isActive: categories.isActive,
  displayOrder: categories.displayOrder,
  seoTitle: categories.seoTitle,
  seoDescription: categories.seoDescription,
  createdAt: categories.createdAt,
  updatedAt: categories.updatedAt,
};

export const categoriesRouter = createTRPCRouter({
  list: adminProcedure.input(listCategoriesInput).query(async ({ input }) => {
    const {
      page,
      perPage,
      search,
      sortBy,
      sortOrder,
      isActive,
      createdAtFrom,
      createdAtTo,
    } = input;
    const offset = (page - 1) * perPage;

    const conditions = [];

    if (search) {
      const escapedSearch = escapeLikeWildcards(search);
      conditions.push(
        or(
          ilike(categories.name, `%${escapedSearch}%`),
          ilike(categories.slug, `%${escapedSearch}%`),
          ilike(categories.description, `%${escapedSearch}%`),
        ),
      );
    }

    if (typeof isActive === "boolean") {
      conditions.push(eq(categories.isActive, isActive));
    }

    if (createdAtFrom) {
      conditions.push(gte(categories.createdAt, new Date(createdAtFrom)));
    }

    if (createdAtTo) {
      conditions.push(lte(categories.createdAt, new Date(createdAtTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderByColumn = {
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
      name: categories.name,
      displayOrder: categories.displayOrder,
    }[sortBy];

    const orderBy =
      sortOrder === "asc"
        ? [asc(orderByColumn), asc(categories.id)]
        : [desc(orderByColumn), desc(categories.id)];

    const [data, total] = await Promise.all([
      db
        .select(categorySelect)
        .from(categories)
        .where(whereClause)
        .orderBy(...orderBy)
        .limit(perPage)
        .offset(offset),
      db
        .select({ count: count() })
        .from(categories)
        .where(whereClause)
        .then(([result]) => result?.count ?? 0),
    ]);

    return {
      data,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }),

  get: adminProcedure.input(getCategoryInput).query(async ({ input }) => {
    const [data] = await db
      .select(categorySelect)
      .from(categories)
      .where(eq(categories.id, input.id));

    if (!data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Categoria não encontrada",
      });
    }

    return data;
  }),

  create: adminProcedure
    .input(createCategoryInput)
    .mutation(async ({ input }) => {
      const slug = await getUniqueCategorySlug(input.name);

      const [data] = await db
        .insert(categories)
        .values({
          ...input,
          slug,
        })
        .returning(categorySelect);

      return data;
    }),

  update: adminProcedure
    .input(updateCategoryInput)
    .mutation(async ({ input }) => {
      const { id, ...values } = input;
      const slug = values.name
        ? await getUniqueCategorySlug(values.name, { excludeId: id })
        : undefined;

      const [data] = await db
        .update(categories)
        .set({
          ...values,
          ...(slug ? { slug } : {}),
        })
        .where(eq(categories.id, id))
        .returning(categorySelect);

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Categoria não encontrada",
        });
      }

      return data;
    }),

  delete: adminProcedure
    .input(deleteCategoryInput)
    .mutation(async ({ input }) => {
      const { data, deletedMediaRows } = await db.transaction(async (tx) => {
        const [data] = await tx
          .delete(categories)
          .where(eq(categories.id, input.id))
          .returning(categorySelect);

        if (!data) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Categoria não encontrada",
          });
        }

        const unusedMediaIds = await getUnusedMediaAssetIds(
          tx,
          data.imageId ? [data.imageId] : [],
        );
        const deletedMediaRows = await deleteMediaAssetRows(
          tx,
          unusedMediaIds,
        );

        return { data, deletedMediaRows };
      });

      // S3 purge runs after the transaction commits — orphaned objects are
      // logged, never thrown, so this can never resurrect a successful delete
      // as a client-facing error.
      await purgeMediaAssetsFromS3(deletedMediaRows);

      return data;
    }),

  deleteMany: adminProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      if (!input.ids.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nenhum id de categoria fornecido",
        });
      }

      try {
        const { deletedRows, deletedMediaRows } = await db.transaction(
          async (tx) => {
            const deletedRows = await tx
              .delete(categories)
              .where(inArray(categories.id, input.ids))
              .returning();

            if (deletedRows.length === 0) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Categorias não encontradas",
              });
            }

            const imageIds = deletedRows
              .map((row) => row.imageId)
              .filter((id): id is string => !!id);

            const unusedMediaIds = await getUnusedMediaAssetIds(tx, imageIds);
            const deletedMediaRows = await deleteMediaAssetRows(
              tx,
              unusedMediaIds,
            );

            return { deletedRows, deletedMediaRows };
          },
        );

        await purgeMediaAssetsFromS3(deletedMediaRows);

        return deletedRows;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao deletar categorias:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro interno ao tentar deletar as categorias",
        });
      }
    }),
});
