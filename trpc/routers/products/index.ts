import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import {
  categories,
  collections,
  inventoryMovements,
  mediaAssets,
  productImages,
  products,
  productsToCollections,
  productVariants,
} from "@/db/schema";
import { escapeLikeWildcards } from "@/lib/db-utils";
import {
  deleteMediaAssetRows,
  purgeMediaAssetsFromS3,
} from "@/lib/media-server";
import { getVariantStockState } from "@/modules/products/utils";
import {
  adjustInventoryInput,
  createProductInput,
  createProductVariantInput,
  deleteProductInput,
  deleteProductVariantInput,
  deleteProductsInput,
  getProductInput,
  listInventoryInput,
  listProductsInput,
  replaceProductVariantsInput,
  updateProductInput,
  updateProductVariantInput,
} from "@/modules/products/validations";
import { getUniqueProductSlug } from "@/modules/products/server-utils";
import {
  assertCategoryExists,
  assertCollectionsExist,
  assertImageAssetsExist,
  assertProductExists,
  unique,
} from "@/modules/products/assertions";
import {
  getUnusedMediaAssetIds,
  insertProductCollections,
  insertProductImages,
  mapProductRow,
  normalizeVariantValues,
  getVariantRefs,
} from "@/modules/products/operations";
import {
  productSelect,
  productVariantSelect,
} from "@/modules/products/queries";
import { rethrowProductWriteError } from "@/modules/products/errors";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";

export const productsRouter = createTRPCRouter({
  list: adminProcedure.input(listProductsInput).query(async ({ input }) => {
    const {
      page,
      perPage,
      search,
      sortBy,
      sortOrder,
      status,
      categoryId,
      collectionId,
      isFeatured,
      createdAtFrom,
      createdAtTo,
    } = input;
    const offset = (page - 1) * perPage;
    const conditions = [];

    if (search) {
      const escapedSearch = escapeLikeWildcards(search);
      const skuMatches = db
        .select({ productId: productVariants.productId })
        .from(productVariants)
        .where(ilike(productVariants.sku, `%${escapedSearch}%`));

      conditions.push(
        or(
          ilike(products.name, `%${escapedSearch}%`),
          ilike(products.slug, `%${escapedSearch}%`),
          ilike(products.subtitle, `%${escapedSearch}%`),
          ilike(products.description, `%${escapedSearch}%`),
          inArray(products.id, skuMatches),
        ),
      );
    }

    if (status) conditions.push(eq(products.status, status));
    if (categoryId) conditions.push(eq(products.categoryId, categoryId));
    if (typeof isFeatured === "boolean") {
      conditions.push(eq(products.isFeatured, isFeatured));
    }
    if (collectionId) {
      const collectionMatches = db
        .select({ productId: productsToCollections.productId })
        .from(productsToCollections)
        .where(eq(productsToCollections.collectionId, collectionId));
      conditions.push(inArray(products.id, collectionMatches));
    }
    if (createdAtFrom) {
      conditions.push(gte(products.createdAt, new Date(createdAtFrom)));
    }
    if (createdAtTo) {
      conditions.push(lte(products.createdAt, new Date(createdAtTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const orderByColumn = {
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      publishedAt: products.publishedAt,
      name: products.name,
      status: products.status,
      basePriceCents: products.basePriceCents,
    }[sortBy];
    const orderBy =
      sortOrder === "asc"
        ? [asc(orderByColumn), asc(products.id)]
        : [desc(orderByColumn), desc(products.id)];

    const [rows, total] = await Promise.all([
      db
        .select({
          ...productSelect,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(whereClause)
        .orderBy(...orderBy)
        .limit(perPage)
        .offset(offset),
      db
        .select({ count: count() })
        .from(products)
        .where(whereClause)
        .then(([result]) => result?.count ?? 0),
    ]);

    const productIds = rows.map((row) => row.id);
    const [variantStats, imageRows, collectionStats] = productIds.length
      ? await Promise.all([
          db
            .select({
              productId: productVariants.productId,
              variantCount: count(),
              activeVariantCount: sql<number>`count(*) filter (where ${productVariants.isActive} = true)::int`,
              totalStock: sql<number>`coalesce(sum(${productVariants.stockQuantity}), 0)::int`,
              lowStockVariantCount: sql<number>`count(*) filter (where ${productVariants.stockQuantity} > 0 and ${productVariants.stockQuantity} <= ${productVariants.lowStockThreshold})::int`,
              outOfStockVariantCount: sql<number>`count(*) filter (where ${productVariants.stockQuantity} = 0)::int`,
            })
            .from(productVariants)
            .where(inArray(productVariants.productId, productIds))
            .groupBy(productVariants.productId),
          db
            .select({
              productId: productImages.productId,
              id: productImages.id,
              mediaAssetId: productImages.mediaAssetId,
              altText: productImages.altText,
              position: productImages.position,
              isPrimary: productImages.isPrimary,
              url: mediaAssets.url,
              filename: mediaAssets.filename,
              assetAltText: mediaAssets.altText,
              width: mediaAssets.width,
              height: mediaAssets.height,
            })
            .from(productImages)
            .innerJoin(
              mediaAssets,
              eq(productImages.mediaAssetId, mediaAssets.id),
            )
            .where(inArray(productImages.productId, productIds))
            .orderBy(
              asc(productImages.productId),
              desc(productImages.isPrimary),
              asc(productImages.position),
              asc(productImages.id),
            ),
          db
            .select({
              productId: productsToCollections.productId,
              collectionCount: count(),
            })
            .from(productsToCollections)
            .where(inArray(productsToCollections.productId, productIds))
            .groupBy(productsToCollections.productId),
        ])
      : [[], [], []];

    const statsByProductId = new Map(
      variantStats.map((stat) => [stat.productId, stat]),
    );
    const collectionCountByProductId = new Map(
      collectionStats.map((stat) => [stat.productId, stat.collectionCount]),
    );
    const primaryImageByProductId = new Map<
      string,
      (typeof imageRows)[number]
    >();
    imageRows.forEach((image) => {
      if (!primaryImageByProductId.has(image.productId)) {
        primaryImageByProductId.set(image.productId, image);
      }
    });

    return {
      data: rows.map((row) => {
        const stats = statsByProductId.get(row.id);
        const primaryImage = primaryImageByProductId.get(row.id);

        return {
          ...mapProductRow(row),
          variantCount: stats?.variantCount ?? 0,
          activeVariantCount: stats?.activeVariantCount ?? 0,
          totalStock: stats?.totalStock ?? 0,
          lowStockVariantCount: stats?.lowStockVariantCount ?? 0,
          outOfStockVariantCount: stats?.outOfStockVariantCount ?? 0,
          collectionCount: collectionCountByProductId.get(row.id) ?? 0,
          primaryImage: primaryImage
            ? {
                id: primaryImage.id,
                mediaAssetId: primaryImage.mediaAssetId,
                altText: primaryImage.altText ?? primaryImage.assetAltText,
                position: primaryImage.position,
                isPrimary: primaryImage.isPrimary,
                url: primaryImage.url,
                filename: primaryImage.filename,
                width: primaryImage.width,
                height: primaryImage.height,
              }
            : null,
        };
      }),
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }),

  get: adminProcedure.input(getProductInput).query(async ({ input }) => {
    const [row] = await db
      .select({
        ...productSelect,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, input.id))
      .limit(1);

    if (!row) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Produto não encontrado",
      });
    }

    const [variants, images, productCollections] = await Promise.all([
      db
        .select(productVariantSelect)
        .from(productVariants)
        .where(eq(productVariants.productId, input.id))
        .orderBy(asc(productVariants.displayOrder), asc(productVariants.id)),
      db
        .select({
          id: productImages.id,
          productId: productImages.productId,
          variantId: productImages.variantId,
          mediaAssetId: productImages.mediaAssetId,
          altText: productImages.altText,
          position: productImages.position,
          isPrimary: productImages.isPrimary,
          createdAt: productImages.createdAt,
          assetUrl: mediaAssets.url,
          assetFilename: mediaAssets.filename,
          assetAltText: mediaAssets.altText,
          assetMimeType: mediaAssets.mimeType,
          assetWidth: mediaAssets.width,
          assetHeight: mediaAssets.height,
        })
        .from(productImages)
        .innerJoin(mediaAssets, eq(productImages.mediaAssetId, mediaAssets.id))
        .where(eq(productImages.productId, input.id))
        .orderBy(
          desc(productImages.isPrimary),
          asc(productImages.position),
          asc(productImages.id),
        ),
      db
        .select({
          id: collections.id,
          name: collections.name,
          slug: collections.slug,
          description: collections.description,
          imageId: collections.imageId,
          isActive: collections.isActive,
          isFeatured: collections.isFeatured,
          displayOrder: productsToCollections.displayOrder,
          featuredAt: productsToCollections.featuredAt,
          createdAt: collections.createdAt,
          updatedAt: collections.updatedAt,
        })
        .from(productsToCollections)
        .innerJoin(
          collections,
          eq(productsToCollections.collectionId, collections.id),
        )
        .where(eq(productsToCollections.productId, input.id))
        .orderBy(
          asc(productsToCollections.displayOrder),
          asc(collections.name),
        ),
    ]);

    return {
      ...mapProductRow(row),
      variants: variants.map((variant) => ({
        ...variant,
        stockState: getVariantStockState(
          variant.stockQuantity,
          variant.lowStockThreshold,
        ),
      })),
      images: images.map((image) => ({
        id: image.id,
        productId: image.productId,
        variantId: image.variantId,
        mediaAssetId: image.mediaAssetId,
        altText: image.altText,
        position: image.position,
        isPrimary: image.isPrimary,
        createdAt: image.createdAt,
        mediaAsset: {
          id: image.mediaAssetId,
          url: image.assetUrl,
          filename: image.assetFilename,
          altText: image.assetAltText,
          mimeType: image.assetMimeType,
          width: image.assetWidth,
          height: image.assetHeight,
        },
      })),
      collections: productCollections,
    };
  }),

  create: adminProcedure
    .input(createProductInput)
    .mutation(async ({ input }) => {
      await Promise.all([
        assertCategoryExists(input.categoryId),
        assertCollectionsExist(input.collectionIds),
        assertImageAssetsExist(input.images),
      ]);

      try {
        const data = await db.transaction(async (tx) => {
          const slug = await getUniqueProductSlug(input.name);
          const [product] = await tx
            .insert(products)
            .values({
              name: input.name,
              slug,
              subtitle: input.subtitle ?? null,
              description: input.description ?? null,
              status: input.status,
              categoryId: input.categoryId ?? null,
              basePriceCents: input.basePriceCents,
              compareAtPriceCents: input.compareAtPriceCents ?? null,
              costCents: input.costCents ?? null,
              currency: input.currency,
              isFeatured: input.isFeatured,
              material: input.material ?? null,
              fit: input.fit ?? null,
              careInstructions: input.careInstructions ?? null,
              seoTitle: input.seoTitle ?? null,
              seoDescription: input.seoDescription ?? null,
              publishedAt: input.status === "active" ? new Date() : null,
            })
            .returning(productSelect);

          if (!product) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Não foi possível criar o produto",
            });
          }

          const variants = await tx
            .insert(productVariants)
            .values(
              input.variants.map((variant, index) =>
                normalizeVariantValues(product.id, variant, index),
              ),
            )
            .returning(productVariantSelect);

          const refs = {
            byId: new Map(variants.map((variant) => [variant.id, variant])),
            bySku: new Map(variants.map((variant) => [variant.sku, variant])),
          };

          await insertProductCollections(tx, product.id, input.collectionIds);
          await insertProductImages(tx, product.id, input.images, refs);

          return product;
        });

        return data;
      } catch (error) {
        return rethrowProductWriteError(error, "Erro ao criar produto");
      }
    }),

  update: adminProcedure
    .input(updateProductInput)
    .mutation(async ({ input }) => {
      const { id, collectionIds, images, ...values } = input;

      const [existing] = await db
        .select(productSelect)
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produto não encontrado",
        });
      }

      const nextBasePrice = values.basePriceCents ?? existing.basePriceCents;
      const nextCompareAt =
        values.compareAtPriceCents === undefined
          ? existing.compareAtPriceCents
          : values.compareAtPriceCents;

      if (nextCompareAt != null && nextCompareAt < nextBasePrice) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Preço de comparação deve ser maior ou igual ao preço base",
        });
      }

      await Promise.all([
        values.categoryId !== undefined
          ? assertCategoryExists(values.categoryId)
          : Promise.resolve(),
        collectionIds
          ? assertCollectionsExist(collectionIds)
          : Promise.resolve(),
        images ? assertImageAssetsExist(images) : Promise.resolve(),
      ]);

      const refs = images ? await getVariantRefs(id) : null;

      try {
        const data = await db.transaction(async (tx) => {
          const slug = values.name
            ? await getUniqueProductSlug(values.name, { excludeId: id })
            : undefined;
          const publishedAt =
            values.status === "active"
              ? (existing.publishedAt ?? new Date())
              : values.status
                ? null
                : undefined;

          const [product] = await tx
            .update(products)
            .set({
              ...(values.name !== undefined ? { name: values.name } : {}),
              ...(slug ? { slug } : {}),
              ...(values.subtitle !== undefined
                ? { subtitle: values.subtitle }
                : {}),
              ...(values.description !== undefined
                ? { description: values.description }
                : {}),
              ...(values.status !== undefined ? { status: values.status } : {}),
              ...(values.categoryId !== undefined
                ? { categoryId: values.categoryId }
                : {}),
              ...(values.basePriceCents !== undefined
                ? { basePriceCents: values.basePriceCents }
                : {}),
              ...(values.compareAtPriceCents !== undefined
                ? { compareAtPriceCents: values.compareAtPriceCents }
                : {}),
              ...(values.costCents !== undefined
                ? { costCents: values.costCents }
                : {}),
              ...(values.currency !== undefined
                ? { currency: values.currency }
                : {}),
              ...(values.isFeatured !== undefined
                ? { isFeatured: values.isFeatured }
                : {}),
              ...(values.material !== undefined
                ? { material: values.material }
                : {}),
              ...(values.fit !== undefined ? { fit: values.fit } : {}),
              ...(values.careInstructions !== undefined
                ? { careInstructions: values.careInstructions }
                : {}),
              ...(values.seoTitle !== undefined
                ? { seoTitle: values.seoTitle }
                : {}),
              ...(values.seoDescription !== undefined
                ? { seoDescription: values.seoDescription }
                : {}),
              ...(publishedAt !== undefined ? { publishedAt } : {}),
            })
            .where(eq(products.id, id))
            .returning(productSelect);

          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Produto não encontrado",
            });
          }

          if (collectionIds) {
            await tx
              .delete(productsToCollections)
              .where(eq(productsToCollections.productId, id));
            await insertProductCollections(tx, id, collectionIds);
          }

          if (images && refs) {
            await tx
              .delete(productImages)
              .where(eq(productImages.productId, id));
            await insertProductImages(tx, id, images, refs);
          }

          return product;
        });

        return data;
      } catch (error) {
        return rethrowProductWriteError(error, "Erro ao atualizar produto");
      }
    }),

  delete: adminProcedure
    .input(deleteProductInput)
    .mutation(async ({ input }) => {
      try {
        const { data, deletedMediaRows } = await db.transaction(async (tx) => {
          const imageRows = await tx
            .select({ mediaAssetId: productImages.mediaAssetId })
            .from(productImages)
            .where(eq(productImages.productId, input.id));
          const mediaIds = unique(
            imageRows.map((row) => row.mediaAssetId).filter(Boolean),
          );

          const [data] = await tx
            .delete(products)
            .where(eq(products.id, input.id))
            .returning(productSelect);

          if (!data) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Produto não encontrado",
            });
          }

          const unusedMediaIds = await getUnusedMediaAssetIds(tx, mediaIds);
          const deletedMediaRows = await deleteMediaAssetRows(
            tx,
            unusedMediaIds,
          );

          return { data, deletedMediaRows };
        });

        await purgeMediaAssetsFromS3(deletedMediaRows);

        return data;
      } catch (error) {
        return rethrowProductWriteError(error, "Erro ao deletar produto");
      }
    }),

  deleteMany: adminProcedure
    .input(deleteProductsInput)
    .mutation(async ({ input }) => {
      try {
        const { deletedRows, deletedMediaRows } = await db.transaction(
          async (tx) => {
            const imageRows = await tx
              .select({ mediaAssetId: productImages.mediaAssetId })
              .from(productImages)
              .where(inArray(productImages.productId, input.ids));
            const mediaIds = unique(
              imageRows.map((row) => row.mediaAssetId).filter(Boolean),
            );

            const deletedRows = await tx
              .delete(products)
              .where(inArray(products.id, input.ids))
              .returning(productSelect);

            if (!deletedRows.length) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Produtos não encontrados",
              });
            }

            const unusedMediaIds = await getUnusedMediaAssetIds(tx, mediaIds);
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
        return rethrowProductWriteError(error, "Erro ao deletar produtos");
      }
    }),

  createVariant: adminProcedure
    .input(createProductVariantInput)
    .mutation(async ({ input }) => {
      await assertProductExists(input.productId);

      try {
        const [variant] = await db
          .insert(productVariants)
          .values(normalizeVariantValues(input.productId, input, 0))
          .returning(productVariantSelect);

        if (!variant) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível criar a variante",
          });
        }

        return {
          ...variant,
          stockState: getVariantStockState(
            variant.stockQuantity,
            variant.lowStockThreshold,
          ),
        };
      } catch (error) {
        return rethrowProductWriteError(error, "Erro ao criar variante");
      }
    }),

  updateVariant: adminProcedure
    .input(updateProductVariantInput)
    .mutation(async ({ input }) => {
      const { id, ...values } = input;
      const [existing] = await db
        .select(productVariantSelect)
        .from(productVariants)
        .where(eq(productVariants.id, id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variante não encontrada",
        });
      }

      const nextPrice =
        values.priceCents === undefined
          ? existing.priceCents
          : values.priceCents;
      const nextCompareAt =
        values.compareAtPriceCents === undefined
          ? existing.compareAtPriceCents
          : values.compareAtPriceCents;

      if (
        nextCompareAt != null &&
        nextPrice != null &&
        nextCompareAt < nextPrice
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Preço de comparação deve ser maior ou igual ao preço",
        });
      }

      try {
        const [variant] = await db
          .update(productVariants)
          .set({
            ...(values.sku !== undefined ? { sku: values.sku } : {}),
            ...(values.colorName !== undefined
              ? { colorName: values.colorName }
              : {}),
            ...(values.colorHex !== undefined
              ? { colorHex: values.colorHex }
              : {}),
            ...(values.size !== undefined ? { size: values.size } : {}),
            ...(values.priceCents !== undefined
              ? { priceCents: values.priceCents }
              : {}),
            ...(values.compareAtPriceCents !== undefined
              ? { compareAtPriceCents: values.compareAtPriceCents }
              : {}),
            ...(values.stockQuantity !== undefined
              ? { stockQuantity: values.stockQuantity }
              : {}),
            ...(values.lowStockThreshold !== undefined
              ? { lowStockThreshold: values.lowStockThreshold }
              : {}),
            ...(values.weightGrams !== undefined
              ? { weightGrams: values.weightGrams }
              : {}),
            ...(values.isActive !== undefined
              ? { isActive: values.isActive }
              : {}),
            ...(values.displayOrder !== undefined
              ? { displayOrder: values.displayOrder }
              : {}),
          })
          .where(eq(productVariants.id, id))
          .returning(productVariantSelect);

        if (!variant) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Variante não encontrada",
          });
        }

        return {
          ...variant,
          stockState: getVariantStockState(
            variant.stockQuantity,
            variant.lowStockThreshold,
          ),
        };
      } catch (error) {
        return rethrowProductWriteError(error, "Erro ao atualizar variante");
      }
    }),

  replaceVariants: adminProcedure
    .input(replaceProductVariantsInput)
    .mutation(async ({ input }) => {
      await assertProductExists(input.productId);

      try {
        const result = await db.transaction(async (tx) => {
          const existingVariants = await tx
            .select({ id: productVariants.id })
            .from(productVariants)
            .where(eq(productVariants.productId, input.productId));
          const existingIds = new Set(existingVariants.map((row) => row.id));
          const incomingIds = new Set(
            input.variants
              .map((variant) => variant.id)
              .filter((id): id is string => !!id),
          );

          const invalidIds = [...incomingIds].filter(
            (id) => !existingIds.has(id),
          );
          if (invalidIds.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Variantes não pertencem ao produto: ${invalidIds.join(", ")}`,
            });
          }

          const saved = [];
          for (const [index, variantInput] of input.variants.entries()) {
            const valuesToSave = normalizeVariantValues(
              input.productId,
              variantInput,
              index,
            );

            if (variantInput.id) {
              const [variant] = await tx
                .update(productVariants)
                .set({
                  sku: valuesToSave.sku,
                  colorName: valuesToSave.colorName,
                  colorHex: valuesToSave.colorHex,
                  size: valuesToSave.size,
                  priceCents: valuesToSave.priceCents,
                  compareAtPriceCents: valuesToSave.compareAtPriceCents,
                  stockQuantity: valuesToSave.stockQuantity,
                  lowStockThreshold: valuesToSave.lowStockThreshold,
                  weightGrams: valuesToSave.weightGrams,
                  isActive: valuesToSave.isActive,
                  displayOrder: valuesToSave.displayOrder,
                })
                .where(
                  and(
                    eq(productVariants.id, variantInput.id),
                    eq(productVariants.productId, input.productId),
                  ),
                )
                .returning(productVariantSelect);
              if (variant) saved.push(variant);
            } else {
              const [variant] = await tx
                .insert(productVariants)
                .values(valuesToSave)
                .returning(productVariantSelect);
              if (variant) saved.push(variant);
            }
          }

          const idsToDelete = [...existingIds].filter(
            (id) => !incomingIds.has(id),
          );
          if (idsToDelete.length) {
            await tx
              .delete(productVariants)
              .where(
                and(
                  eq(productVariants.productId, input.productId),
                  inArray(productVariants.id, idsToDelete),
                ),
              );
          }

          return {
            productId: input.productId,
            variants: saved
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((variant) => ({
                ...variant,
                stockState: getVariantStockState(
                  variant.stockQuantity,
                  variant.lowStockThreshold,
                ),
              })),
          };
        });

        return result;
      } catch (error) {
        return rethrowProductWriteError(error, "Erro ao substituir variantes");
      }
    }),

  deleteVariant: adminProcedure
    .input(deleteProductVariantInput)
    .mutation(async ({ input }) => {
      const [existing] = await db
        .select(productVariantSelect)
        .from(productVariants)
        .where(eq(productVariants.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variante não encontrada",
        });
      }

      const [{ count: variantCount }] = await db
        .select({ count: count() })
        .from(productVariants)
        .where(eq(productVariants.productId, existing.productId));

      if (variantCount <= 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Produto deve manter pelo menos uma variante",
        });
      }

      try {
        const [variant] = await db
          .delete(productVariants)
          .where(eq(productVariants.id, input.id))
          .returning(productVariantSelect);

        if (!variant) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Variante não encontrada",
          });
        }

        return {
          ...variant,
          stockState: getVariantStockState(
            variant.stockQuantity,
            variant.lowStockThreshold,
          ),
        };
      } catch (error) {
        return rethrowProductWriteError(error, "Erro ao deletar variante");
      }
    }),

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
});
