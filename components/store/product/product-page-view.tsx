"use client";

import { useStoreProductSuspense } from "@/modules/products/hooks";
import { ProductHeader } from "./product-header";
import { ProductExperience } from "./product-experience";

export const ProductPageView = ({ slug }: { slug: string }) => {
  const { data: product } = useStoreProductSuspense({ slug });

  return (
    <>
      <ProductHeader product={product} />
      <ProductExperience product={product} />
    </>
  );
};
