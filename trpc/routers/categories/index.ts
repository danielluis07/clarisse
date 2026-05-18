import { db } from "@/db";
import { categories } from "@/db/schema";
import { escapeLikeWildcards } from "@/lib/db-utils";
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
      sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    const [data, total] = await Promise.all([
      db
        .select(categorySelect)
        .from(categories)
        .where(whereClause)
        .orderBy(orderBy)
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
      const [data] = await db
        .delete(categories)
        .where(eq(categories.id, input.id))
        .returning(categorySelect);

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Categoria não encontrada",
        });
      }

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
        const deletedRows = await db
          .delete(categories)
          .where(inArray(categories.id, input.ids))
          .returning();

        if (deletedRows.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Categorias não encontradas",
          });
        }

        return deletedRows;
      } catch (error) {
        console.error("Erro ao deletar categorias:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro interno ao tentar deletar as categorias",
        });
      }
    }),
});
