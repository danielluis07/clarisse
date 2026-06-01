import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductBreadcrumb } from "@/components/store/product/product-breadcrumb";
import { Newsletter } from "@/components/store/home/newsletter";
import { CollectionHero } from "@/components/store/collections/collection-hero";
import { CollectionHighlights } from "@/components/store/collections/collection-highlights";
import {
  CollectionProductsSection,
  CollectionProductsSkeleton,
} from "@/components/store/collections/collection-products-section";
import { getStoreCollectionBySlug } from "@/modules/collections/storefront";
import { getStoreProducts } from "@/modules/products/storefront";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const collection = await getStoreCollectionBySlug(slug);

  if (!collection) return { title: "Coleção | Clarisse" };

  return {
    title: `${collection.seoTitle ?? collection.name} | Clarisse`,
    description:
      collection.seoDescription ?? collection.description ?? undefined,
  };
};

const CollectionDetailPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const collectionPromise = getStoreCollectionBySlug(slug);
  const productsPromise = getStoreProducts({
    collectionSlug: slug,
    perPage: 24,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });
  const collection = await collectionPromise;

  if (!collection) notFound();

  return (
    <>
      <ProductBreadcrumb
        crumbs={[
          { label: "Início", href: "/" },
          { label: "Coleções", href: "/colecoes" },
          { label: collection.name },
        ]}
      />

      <CollectionHero collection={collection} />
      <CollectionHighlights collection={collection} />
      <Suspense fallback={<CollectionProductsSkeleton />}>
        <CollectionProductsSection productsPromise={productsPromise} />
      </Suspense>
      {/* <CollectionExploreLink /> */}

      <Newsletter />
    </>
  );
};

export default CollectionDetailPage;
