import { Hero } from "@/components/store/home/hero";
import { NewArrivals } from "@/components/store/home/new-arrivals";
import { CategoryEdit } from "@/components/store/home/category-edit";
import { EditorialSplit } from "@/components/store/home/editorial-split";
import { Lookbook } from "@/components/store/home/lookbook";
import { FeaturedCollections } from "@/components/store/home/featured-collections";
import { WardrobeEssentials } from "@/components/store/home/wardrobe-essentials";
import { EditorialBanner } from "@/components/store/home/editorial-banner";
import { Newsletter } from "@/components/store/home/newsletter";

export default function StoreHome() {
  return (
    <>
      <Hero />
      <NewArrivals />
      <CategoryEdit />
      <EditorialSplit />
      <Lookbook />
      <FeaturedCollections />
      <WardrobeEssentials />
      <EditorialBanner />
      <Newsletter />
    </>
  );
}
