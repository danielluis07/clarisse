"use client";

import { ProductBreadcrumb } from "./product-breadcrumb";
import { ProductEditorial } from "./product-editorial";
import { useStoreProductSuspense } from "@/modules/products/hooks";

export const ProductHeader = ({ slug }: { slug: string }) => {
  const { data: product } = useStoreProductSuspense({ slug });

  const categoryHref = product.category?.slug
    ? `/categorias/${product.category.slug}`
    : null;

  return (
    <ProductBreadcrumb
      crumbs={[
        { label: "Início", href: "/" },
        ...(product.category
          ? [
              {
                label: product.category.name,
                href: categoryHref ?? undefined,
              },
            ]
          : []),
        { label: product.name },
      ]}
    />
  );
};

export const ProductEditorialBlock = ({ slug }: { slug: string }) => {
  const { data: product } = useStoreProductSuspense({ slug });

  const editorialImage =
    product.colorImageSets?.[0]?.images?.[1]?.mediaAsset.url ??
    product.colorImageSets?.[0]?.images?.[0]?.mediaAsset.url ??
    product.images?.[1]?.mediaAsset.url ??
    product.images?.[0]?.mediaAsset.url ??
    null;

  if (!editorialImage) return null;

  return (
    <ProductEditorial
      image={editorialImage}
      alt={`${product.name} em editorial`}
      quote="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Uma peça pensada para permanecer, estação após estação."
      caption="Atelier Clarisse · São Paulo"
    />
  );
};
