import "server-only";

import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  ilike,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  inventoryMovements,
  products,
  productVariants,
} from "@/db/schema";
import { escapeLikeWildcards } from "@/lib/db-utils";
import { rethrowProductWriteError } from "@/modules/products/server/errors";
import { productVariantSelect } from "@/modules/products/server/queries";
import { getVariantStockState } from "@/modules/products/utils";
import {
  adjustInventoryInput,
  listInventoryInput,
} from "@/modules/products/validations";
import { adminProcedure } from "@/trpc/init";

export const productsInventoryProcedures = {
  inventoryList: adminProcedure
    .input(listInventoryInput)
    .query(async ({ input }) => {
      const {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        productId,
        categoryId,
        status,
        isActive,
        stockStatus,
      } = input;
      const offset = (page - 1) * perPage;
      const conditions = [];

      if (search) {
        const escapedSearch = escapeLikeWildcards(search);
        conditions.push(
          or(
            ilike(products.name, `%${escapedSearch}%`),
            ilike(productVariants.sku, `%${escapedSearch}%`),
            ilike(productVariants.colorName, `%${escapedSearch}%`),
            ilike(productVariants.size, `%${escapedSearch}%`),
          ),
        );
      }

      if (productId) conditions.push(eq(productVariants.productId, productId));
      if (categoryId) conditions.push(eq(products.categoryId, categoryId));
      if (status) conditions.push(eq(products.status, status));
      if (typeof isActive === "boolean") {
        conditions.push(eq(productVariants.isActive, isActive));
      }
      if (stockStatus === "out_of_stock") {
        conditions.push(eq(productVariants.stockQuantity, 0));
      }
      if (stockStatus === "low_stock") {
        conditions.push(
          and(
            gt(productVariants.stockQuantity, 0),
            lte(
              productVariants.stockQuantity,
              productVariants.lowStockThreshold,
            ),
          ),
        );
      }
      if (stockStatus === "in_stock") {
        conditions.push(
          gt(productVariants.stockQuantity, productVariants.lowStockThreshold),
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;
      const orderByColumn = {
        productName: products.name,
        sku: productVariants.sku,
        stockQuantity: productVariants.stockQuantity,
        updatedAt: productVariants.updatedAt,
        displayOrder: productVariants.displayOrder,
      }[sortBy];
      const orderBy =
        sortOrder === "asc"
          ? [asc(orderByColumn), asc(productVariants.id)]
          : [desc(orderByColumn), desc(productVariants.id)];

      const [rows, total] = await Promise.all([
        db
          .select({
            ...productVariantSelect,
            productName: products.name,
            productSlug: products.slug,
            productStatus: products.status,
            categoryId: products.categoryId,
            categoryName: categories.name,
            categorySlug: categories.slug,
          })
          .from(productVariants)
          .innerJoin(products, eq(productVariants.productId, products.id))
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(whereClause)
          .orderBy(...orderBy)
          .limit(perPage)
          .offset(offset),
        db
          .select({ count: count() })
          .from(productVariants)
          .innerJoin(products, eq(productVariants.productId, products.id))
          .where(whereClause)
          .then(([result]) => result?.count ?? 0),
      ]);

      return {
        data: rows.map((row) => ({
          id: row.id,
          productId: row.productId,
          productName: row.productName,
          productSlug: row.productSlug,
          productStatus: row.productStatus,
          category: row.categoryName
            ? {
                id: row.categoryId,
                name: row.categoryName,
                slug: row.categorySlug,
              }
            : null,
          sku: row.sku,
          colorName: row.colorName,
          colorHex: row.colorHex,
          size: row.size,
          stockQuantity: row.stockQuantity,
          lowStockThreshold: row.lowStockThreshold,
          isActive: row.isActive,
          displayOrder: row.displayOrder,
          updatedAt: row.updatedAt,
          stockState: getVariantStockState(
            row.stockQuantity,
            row.lowStockThreshold,
          ),
        })),
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      };
    }),

  adjustInventory: adminProcedure
    .input(adjustInventoryInput)
    .mutation(async ({ ctx, input }) => {
      const [existing] = await db
        .select(productVariantSelect)
        .from(productVariants)
        .where(eq(productVariants.id, input.productVariantId))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variante não encontrada",
        });
      }

      try {
        const variant = await db.transaction(async (tx) => {
          const [updated] = await tx
            .update(productVariants)
            .set({
              stockQuantity: sql`${productVariants.stockQuantity} + ${input.quantityDelta}`,
            })
            .where(
              and(
                eq(productVariants.id, input.productVariantId),
                sql`${productVariants.stockQuantity} + ${input.quantityDelta} >= 0`,
              ),
            )
            .returning(productVariantSelect);

          if (!updated) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Estoque não pode ficar negativo",
            });
          }

          await tx.insert(inventoryMovements).values({
            productVariantId: input.productVariantId,
            type: input.type,
            quantityDelta: input.quantityDelta,
            reason: input.reason ?? null,
            referenceType: input.referenceType ?? "manual",
            referenceId: input.referenceId ?? null,
            createdById: ctx.adminId,
          });

          return updated;
        });

        return {
          ...variant,
          stockState: getVariantStockState(
            variant.stockQuantity,
            variant.lowStockThreshold,
          ),
        };
      } catch (error) {
        return rethrowProductWriteError(error, "Erro ao ajustar estoque");
      }
    }),
};
