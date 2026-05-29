import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ProductPageView } from "@/components/store/product/product-page-view";
import { RelatedProducts } from "@/components/store/related-products";
import {
  prefetchStoreProduct,
  prefetchStoreRelatedProducts,
} from "@/modules/products/prefetch";
import { HydrateClient } from "@/trpc/server";

const ProductDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  prefetchStoreProduct(slug);
  prefetchStoreRelatedProducts(slug);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<ProductErrorState />}>
        <Suspense fallback={<ProductExperienceSkeleton />}>
          <ProductPageView slug={slug} />
        </Suspense>

        <ErrorBoundary fallback={null}>
          <Suspense fallback={<RelatedProductsSkeleton />}>
            <RelatedProducts slug={slug} />
          </Suspense>
        </ErrorBoundary>
      </ErrorBoundary>
    </HydrateClient>
  );
};

const ProductExperienceSkeleton = () => (
  <section className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-12 px-6 py-10 md:px-10 md:py-14 lg:grid-cols-12 lg:gap-16 lg:py-16">
    <div className="lg:col-span-7">
      <div className="aspect-3/4 w-full animate-pulse bg-foreground/5" />
    </div>
    <div className="space-y-6 lg:col-span-5">
      <div className="h-3 w-32 animate-pulse bg-foreground/10" />
      <div className="h-10 w-3/4 animate-pulse bg-foreground/10" />
      <div className="h-8 w-1/3 animate-pulse bg-foreground/10" />
      <div className="h-12 w-full animate-pulse bg-foreground/10" />
      <div className="h-12 w-full animate-pulse bg-foreground/10" />
    </div>
  </section>
);

const RelatedProductsSkeleton = () => (
  <section className="border-t border-foreground/10">
    <div className="mx-auto max-w-screen-2xl px-6 py-16 md:px-10 md:py-24">
      <div className="h-9 w-72 max-w-full animate-pulse bg-foreground/10" />
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 md:mt-14 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-3/4 w-full animate-pulse bg-foreground/5" />
            <div className="h-3 w-2/3 animate-pulse bg-foreground/10" />
            <div className="h-3 w-1/3 animate-pulse bg-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProductErrorState = () => (
  <div className="mx-auto max-w-screen-2xl px-6 py-24 md:px-10">
    <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/55">
      Algo deu errado
    </p>
    <h1 className="mt-4 font-heading text-3xl font-light md:text-4xl">
      Não foi possível carregar este produto.
    </h1>
    <p className="mt-3 text-sm text-foreground/65">
      Tente novamente em instantes ou volte ao catálogo.
    </p>
  </div>
);

export default ProductDetailsPage;
