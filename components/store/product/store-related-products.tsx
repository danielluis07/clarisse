"use client";

import { useMemo } from "react";
import { RelatedProducts } from "@/components/store/related-products";
import { useStoreRelatedProductsSuspense } from "@/modules/products/hooks";
import { buildRelatedProductCard } from "@/modules/products/store-utils";

export const StoreRelatedProducts = ({
  slug,
  limit = 4,
  index,
  eyebrow,
  title = "Complete o look",
  description,
  ctaLabel,
  ctaHref,
}: {
  slug: string;
  limit?: number;
  index?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) => {
  const { data } = useStoreRelatedProductsSuspense({ slug, limit });

  const cards = useMemo(
    () =>
      data
        .map(buildRelatedProductCard)
        .filter((card): card is NonNullable<typeof card> => card !== null),
    [data],
  );

  return (
    <RelatedProducts
      index={index}
      eyebrow={eyebrow}
      title={title}
      description={description}
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
      products={cards}
    />
  );
};
