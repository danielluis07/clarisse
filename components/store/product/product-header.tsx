"use client";

import type { StoreProductOutput } from "@/modules/products/types";
import { ProductBreadcrumb } from "@/components/store/product/product-breadcrumb";
import { ProductEditorial } from "@/components/store/product/product-editorial";

export const ProductHeader = ({ product }: { product: StoreProductOutput }) => {
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

export const ProductEditorialBlock = ({
  product,
}: {
  product: StoreProductOutput;
}) => {
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
