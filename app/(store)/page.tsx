import { Hero } from "@/components/store/home/hero";
import { HeroSkeleton } from "@/components/store/home/skeletons/hero-skeleton";
import { CategoryGrid } from "@/components/store/home/category-grid";
import { FeaturedCollection } from "@/components/store/home/featured-collection";
import { FeaturedProducts } from "@/components/store/home/featured-products";
import { EditorialBanner } from "@/components/store/home/editorial-banner";
import { ServiceHighlights } from "@/components/store/home/service-highlights";
import { Newsletter } from "@/components/store/home/newsletter";
import { Suspense } from "react";

export default function StoreHome() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
      <FeaturedProducts />
      <CategoryGrid />
      <FeaturedCollection />
      <EditorialBanner />
      <ServiceHighlights />
      <Newsletter />
    </>
  );
}
