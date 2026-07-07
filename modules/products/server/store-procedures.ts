import "server-only";

import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  collections,
  mediaAssets,
  productImages,
  products,
  productsToCollections,
  productVariants,
} from "@/db/schema";
import { escapeLikeWildcards } from "@/lib/db-utils";
import { mapProductRow } from "@/modules/products/server/operations";
import { productVariantSelect } from "@/modules/products/server/queries";
import { getVariantStockState } from "@/modules/products/utils";
import {
  getStoreProductInput,
  getStoreRelatedProductsInput,
  listStoreProductsInput,
} from "@/modules/products/validations";
import { baseProcedure } from "@/trpc/init";

export const productsStoreProcedures = {
  listStoreProducts: baseProcedure
    .input(listStoreProductsInput)
    .query(async ({ input }) => {
      const {
        page,
        perPage,
        search,
        categoryId,
        collectionSlug,
        isFeatured,
        sortBy,
        sortOrder,
      } = input;
      const offset = (page - 1) * perPage;
      const conditions = [eq(products.status, "active")];

      if (search) {
        const escapedSearch = escapeLikeWildcards(search);
        const searchCondition = or(
          ilike(products.name, `%${escapedSearch}%`),
          ilike(products.subtitle, `%${escapedSearch}%`),
          ilike(products.description, `%${escapedSearch}%`),
        );

        if (searchCondition) conditions.push(searchCondition);
      }
      if (typeof isFeatured === "boolean") {
        conditions.push(eq(products.isFeatured, isFeatured));
      }
      if (categoryId) {
        conditions.push(eq(products.categoryId, categoryId));
      }
      if (collectionSlug) {
        const collectionMatches = db
          .select({ productId: productsToCollections.productId })
          .from(productsToCollections)
          .innerJoin(
            collections,
            eq(productsToCollections.collectionId, collections.id),
          )
          .where(
            and(
              eq(collections.slug, collectionSlug),
              eq(collections.isActive, true),
            ),
          );

        conditions.push(inArray(products.id, collectionMatches));
      }

      const orderBy =
        sortBy === "random"
          ? [sql`random()`]
          : (() => {
              const orderByColumn = {
                createdAt: products.createdAt,
                publishedAt: products.publishedAt,
                name: products.name,
                basePriceCents: products.basePriceCents,
              }[sortBy];

              return sortBy === "publishedAt"
                ? sortOrder === "asc"
                  ? [
                      sql`${products.publishedAt} asc nulls last`,
                      asc(products.createdAt),
                      asc(products.id),
                    ]
                  : [
                      sql`${products.publishedAt} desc nulls last`,
                      desc(products.createdAt),
                      desc(products.id),
                    ]
                : sortOrder === "asc"
                  ? [asc(orderByColumn), asc(products.id)]
                  : [desc(orderByColumn), desc(products.id)];
            })();
      const whereClause = and(...conditions);

      const [rows, total] = await Promise.all([
        db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            subtitle: products.subtitle,
            basePriceCents: products.basePriceCents,
            compareAtPriceCents: products.compareAtPriceCents,
            currency: products.currency,
            isFeatured: products.isFeatured,
            publishedAt: products.publishedAt,
            createdAt: products.createdAt,
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
      const [imageRows, variantRows] = productIds.length
        ? await Promise.all([
            db
              .select({
                productId: productImages.productId,
                isPrimary: productImages.isPrimary,
                position: productImages.position,
                colorName: productImages.colorName,
                colorHex: productImages.colorHex,
                url: mediaAssets.url,
                altText: productImages.altText,
                assetAltText: mediaAssets.altText,
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
                productId: productVariants.productId,
                colorName: productVariants.colorName,
                colorHex: productVariants.colorHex,
                stockQuantity: productVariants.stockQuantity,
              })
              .from(productVariants)
              .where(
                and(
                  inArray(productVariants.productId, productIds),
                  eq(productVariants.isActive, true),
                ),
              )
              .orderBy(
                asc(productVariants.productId),
                asc(productVariants.displayOrder),
                asc(productVariants.id),
              ),
          ])
        : [[], []];

      const imagesByProductId = new Map<string, typeof imageRows>();
      imageRows.forEach((image) => {
        const list = imagesByProductId.get(image.productId);
        if (list) {
          list.push(image);
        } else {
          imagesByProductId.set(image.productId, [image]);
        }
      });

      const variantsByProductId = new Map<string, typeof variantRows>();
      variantRows.forEach((variant) => {
        const list = variantsByProductId.get(variant.productId);
        if (list) {
          list.push(variant);
        } else {
          variantsByProductId.set(variant.productId, [variant]);
        }
      });

      return {
        data: rows.map((row) => {
          const productImagesForRow = imagesByProductId.get(row.id) ?? [];
          const [primary, secondary] = productImagesForRow;
          const productVariantsForRow = variantsByProductId.get(row.id) ?? [];
          const colorsByName = new Map<
            string,
            { name: string; hex: string | null }
          >();

          productVariantsForRow.forEach((variant) => {
            const colorKey = variant.colorName.trim().toLowerCase();
            const existing = colorsByName.get(colorKey);

            if (!existing || (!existing.hex && variant.colorHex)) {
              colorsByName.set(colorKey, {
                name: variant.colorName,
                hex: variant.colorHex,
              });
            }
          });

          return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            subtitle: row.subtitle,
            basePriceCents: row.basePriceCents,
            compareAtPriceCents: row.compareAtPriceCents,
            currency: row.currency,
            isFeatured: row.isFeatured,
            publishedAt: row.publishedAt,
            createdAt: row.createdAt,
            category: row.categoryName
              ? { name: row.categoryName, slug: row.categorySlug }
              : null,
            primaryImage: primary
              ? {
                  url: primary.url,
                  altText: primary.altText ?? primary.assetAltText,
                }
              : null,
            hoverImage:
              secondary && secondary.url !== primary?.url
                ? {
                    url: secondary.url,
                    altText: secondary.altText ?? secondary.assetAltText,
                  }
                : null,
            colors: Array.from(colorsByName.values()),
            hasStock: productVariantsForRow.some(
              (variant) => variant.stockQuantity > 0,
            ),
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

  getStoreProduct: baseProcedure
    .input(getStoreProductInput)
    .query(async ({ input }) => {
      const [row] = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          subtitle: products.subtitle,
          description: products.description,
          status: products.status,
          categoryId: products.categoryId,
          basePriceCents: products.basePriceCents,
          compareAtPriceCents: products.compareAtPriceCents,
          currency: products.currency,
          isFeatured: products.isFeatured,
          material: products.material,
          fit: products.fit,
          careInstructions: products.careInstructions,
          seoTitle: products.seoTitle,
          seoDescription: products.seoDescription,
          publishedAt: products.publishedAt,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(
          and(eq(products.slug, input.slug), eq(products.status, "active")),
        )
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
          .where(
            and(
              eq(productVariants.productId, row.id),
              eq(productVariants.isActive, true),
            ),
          )
          .orderBy(asc(productVariants.displayOrder), asc(productVariants.id)),
        db
          .select({
            id: productImages.id,
            productId: productImages.productId,
            variantId: productImages.variantId,
            colorName: productImages.colorName,
            colorHex: productImages.colorHex,
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
          .innerJoin(
            mediaAssets,
            eq(productImages.mediaAssetId, mediaAssets.id),
          )
          .where(eq(productImages.productId, row.id))
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
            isFeatured: collections.isFeatured,
            displayOrder: productsToCollections.displayOrder,
          })
          .from(productsToCollections)
          .innerJoin(
            collections,
            eq(productsToCollections.collectionId, collections.id),
          )
          .where(
            and(
              eq(productsToCollections.productId, row.id),
              eq(collections.isActive, true),
            ),
          )
          .orderBy(
            asc(productsToCollections.displayOrder),
            asc(collections.name),
          ),
      ]);

      const imageItems = images.map((image) => ({
        id: image.id,
        productId: image.productId,
        variantId: image.variantId,
        colorName: image.colorName,
        colorHex: image.colorHex,
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
      }));
      const colorsByName = new Map<
        string,
        { colorName: string; colorHex: string | null }
      >();

      variants.forEach((variant) => {
        const colorKey = variant.colorName.trim().toLowerCase();
        const existing = colorsByName.get(colorKey);

        if (!existing || (!existing.colorHex && variant.colorHex)) {
          colorsByName.set(colorKey, {
            colorName: variant.colorName,
            colorHex: variant.colorHex,
          });
        }
      });

      return {
        ...mapProductRow(row),
        primaryImage:
          imageItems.find((image) => image.isPrimary) ?? imageItems[0] ?? null,
        images: imageItems,
        colorImageSets: Array.from(colorsByName.entries()).map(
          ([colorKey, color]) => ({
            ...color,
            images: imageItems.filter(
              (image) => image.colorName?.trim().toLowerCase() === colorKey,
            ),
          }),
        ),
        variants: variants.map((variant) => ({
          ...variant,
          stockState: getVariantStockState(
            variant.stockQuantity,
            variant.lowStockThreshold,
          ),
        })),
        collections: productCollections,
      };
    }),

  getStoreRelatedProducts: baseProcedure
    .input(getStoreRelatedProductsInput)
    .query(async ({ input }) => {
      const [current] = await db
        .select({ id: products.id, categoryId: products.categoryId })
        .from(products)
        .where(
          and(eq(products.slug, input.slug), eq(products.status, "active")),
        )
        .limit(1);

      if (!current) return [];

      const conditions = [
        eq(products.status, "active"),
        sql`${products.id} <> ${current.id}`,
      ];

      if (current.categoryId) {
        conditions.push(eq(products.categoryId, current.categoryId));
      }

      const rows = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          basePriceCents: products.basePriceCents,
          compareAtPriceCents: products.compareAtPriceCents,
          currency: products.currency,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(desc(products.isFeatured), desc(products.publishedAt))
        .limit(input.limit);

      if (rows.length === 0) return [];

      const ids = rows.map((row) => row.id);
      const imageRows = await db
        .select({
          productId: productImages.productId,
          isPrimary: productImages.isPrimary,
          position: productImages.position,
          colorName: productImages.colorName,
          url: mediaAssets.url,
          altText: mediaAssets.altText,
        })
        .from(productImages)
        .innerJoin(mediaAssets, eq(productImages.mediaAssetId, mediaAssets.id))
        .where(inArray(productImages.productId, ids))
        .orderBy(
          asc(productImages.productId),
          desc(productImages.isPrimary),
          asc(productImages.position),
          asc(productImages.id),
        );

      const imagesByProductId = new Map<string, typeof imageRows>();
      imageRows.forEach((image) => {
        const list = imagesByProductId.get(image.productId);
        if (list) {
          list.push(image);
        } else {
          imagesByProductId.set(image.productId, [image]);
        }
      });

      return rows.map((row) => {
        const productImagesForRow = imagesByProductId.get(row.id) ?? [];
        const [primary, secondary] = productImagesForRow;

        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          basePriceCents: row.basePriceCents,
          compareAtPriceCents: row.compareAtPriceCents,
          currency: row.currency,
          category: row.categoryName
            ? { name: row.categoryName, slug: row.categorySlug }
            : null,
          primaryImage: primary
            ? { url: primary.url, altText: primary.altText }
            : null,
          hoverImage:
            secondary && secondary.url !== primary?.url
              ? { url: secondary.url, altText: secondary.altText }
              : null,
        };
      });
    }),
};
