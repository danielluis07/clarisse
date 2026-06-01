import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { collections, mediaAssets, products, productsToCollections } from "@/db/schema";
import {
  getStoreCollectionInput,
  listStoreCollectionsInput,
} from "@/modules/collections/validations";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

const collectionImageSelect = {
  imageAssetId: mediaAssets.id,
  imageUrl: mediaAssets.url,
  imageFilename: mediaAssets.filename,
  imageAltText: mediaAssets.altText,
  imageMimeType: mediaAssets.mimeType,
  imageWidth: mediaAssets.width,
  imageHeight: mediaAssets.height,
};

const mapStoreCollection = <
  T extends {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    isFeatured: boolean;
    displayOrder: number;
    seoTitle: string | null;
    seoDescription: string | null;
    productCount: number;
    imageAssetId: string | null;
    imageUrl: string | null;
    imageFilename: string | null;
    imageAltText: string | null;
    imageMimeType: string | null;
    imageWidth: number | null;
    imageHeight: number | null;
  },
>(
  row: T,
) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  isFeatured: row.isFeatured,
  displayOrder: row.displayOrder,
  seoTitle: row.seoTitle,
  seoDescription: row.seoDescription,
  productCount: row.productCount,
  image: row.imageAssetId
    ? {
        id: row.imageAssetId,
        url: row.imageUrl,
        filename: row.imageFilename,
        altText: row.imageAltText,
        mimeType: row.imageMimeType,
        width: row.imageWidth,
        height: row.imageHeight,
      }
    : null,
});

export const collectionsRouter = createTRPCRouter({
  listStoreCollections: baseProcedure
    .input(listStoreCollectionsInput)
    .query(async ({ input }) => {
      const query = db
        .select({
          id: collections.id,
          name: collections.name,
          slug: collections.slug,
          description: collections.description,
          isFeatured: collections.isFeatured,
          displayOrder: collections.displayOrder,
          seoTitle: collections.seoTitle,
          seoDescription: collections.seoDescription,
          productCount: sql<number>`count(${products.id})::int`,
          ...collectionImageSelect,
        })
        .from(collections)
        .leftJoin(mediaAssets, eq(collections.imageId, mediaAssets.id))
        .leftJoin(
          productsToCollections,
          eq(collections.id, productsToCollections.collectionId),
        )
        .leftJoin(
          products,
          and(
            eq(productsToCollections.productId, products.id),
            eq(products.status, "active"),
          ),
        )
        .where(eq(collections.isActive, true))
        .groupBy(collections.id, mediaAssets.id)
        .orderBy(
          desc(collections.isFeatured),
          asc(collections.displayOrder),
          asc(collections.name),
          asc(collections.id),
        );

      const rows = input.limit ? await query.limit(input.limit) : await query;

      return rows.map(mapStoreCollection);
    }),

  getStoreCollection: baseProcedure
    .input(getStoreCollectionInput)
    .query(async ({ input }) => {
      const [row] = await db
        .select({
          id: collections.id,
          name: collections.name,
          slug: collections.slug,
          description: collections.description,
          isFeatured: collections.isFeatured,
          displayOrder: collections.displayOrder,
          seoTitle: collections.seoTitle,
          seoDescription: collections.seoDescription,
          productCount: sql<number>`count(${products.id})::int`,
          ...collectionImageSelect,
        })
        .from(collections)
        .leftJoin(mediaAssets, eq(collections.imageId, mediaAssets.id))
        .leftJoin(
          productsToCollections,
          eq(collections.id, productsToCollections.collectionId),
        )
        .leftJoin(
          products,
          and(
            eq(productsToCollections.productId, products.id),
            eq(products.status, "active"),
          ),
        )
        .where(and(eq(collections.slug, input.slug), eq(collections.isActive, true)))
        .groupBy(collections.id, mediaAssets.id)
        .limit(1);

      return row ? mapStoreCollection(row) : null;
    }),
});
