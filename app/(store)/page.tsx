import { Hero } from "@/components/store/home/hero";
import { HeroSkeleton } from "@/components/store/home/skeletons/hero-skeleton";
import { CategoriesGrid } from "@/components/store/home/categories-grid";
import { CategoriesGridSkeleton } from "@/components/store/home/skeletons/categories-grid-skeleton";
import { ProductsRowSkeleton } from "@/components/store/home/skeletons/products-row-skeleton";
import { FeaturedCollection } from "@/components/store/home/featured-collection";
import { FeaturedProducts } from "@/components/store/home/featured-products";
import { NewProducts } from "@/components/store/home/new-products";
import { EditorialBanner } from "@/components/store/home/editorial-banner";
import { ServiceHighlights } from "@/components/store/home/service-highlights";
import { BestSellersProducts } from "@/components/store/home/best-sellers-products";
import { Newsletter } from "@/components/store/home/newsletter";
import { Suspense } from "react";

export default function StoreHome() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
      <Suspense fallback={<ProductsRowSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <Suspense fallback={<CategoriesGridSkeleton />}>
        <CategoriesGrid />
      </Suspense>
      <FeaturedCollection />
      <Suspense fallback={<ProductsRowSkeleton />}>
        <NewProducts />
      </Suspense>
      <EditorialBanner />
      <ServiceHighlights />
      <Suspense fallback={<ProductsRowSkeleton />}>
        <BestSellersProducts />
      </Suspense>
      <Newsletter />
    </>
  );
}
