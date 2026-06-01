import { centsToReais } from "@/lib/utils";
import type { ProductGridItem } from "@/components/store/home/products-row";
import type {
  StoreProduct,
  StoreProductColor,
  StoreProductImage,
} from "@/modules/products/types";

const fallbackImages = [
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=1200&auto=format&fit=crop",
] as const;

const getProductImage = (image: StoreProductImage | null, index: number) =>
  image?.url ?? fallbackImages[index % fallbackImages.length];

const getProductColors = (colors: StoreProductColor[]) =>
  colors
    .filter((color): color is { name: string; hex: string } => !!color.hex)
    .map((color) => ({ name: color.name, hex: color.hex }));

export const mapStoreProduct = (
  product: StoreProduct,
  index: number,
  badge: string,
): ProductGridItem => ({
  slug: product.slug,
  name: product.name,
  category: product.category?.name,
  price: centsToReais(product.basePriceCents),
  comparePrice: product.compareAtPriceCents
    ? centsToReais(product.compareAtPriceCents)
    : undefined,
  badge,
  image: getProductImage(product.primaryImage, index),
  hoverImage: product.hoverImage?.url,
  colors: getProductColors(product.colors),
});
