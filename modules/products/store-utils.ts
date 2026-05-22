import { centsToReais } from "@/lib/utils";
import type {
  StoreProductOutput,
  StoreRelatedProductItem,
} from "@/modules/products/types";

export type StoreProductColor = {
  name: string;
  slug: string;
  hex: string | null;
  imageUrls: string[];
};

export type StoreProductSizeOption = {
  label: string;
  variantId: string | null;
  inStock: boolean;
};

export type StoreProductView = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  category: { name: string; slug: string | null; href: string } | null;
  collection: { name: string; slug: string; href: string } | null;
  priceLabel: string;
  comparePriceLabel: string | null;
  basePriceCents: number;
  installmentLabel: string | null;
  material: string | null;
  fit: string | null;
  careInstructions: string | null;
  colors: StoreProductColor[];
  allImageUrls: string[];
  primaryImageAlt: string;
};

export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "default";

export const buildStoreProductView = (
  product: StoreProductOutput,
): StoreProductView => {
  const colorSets = product.colorImageSets ?? [];
  const fallbackImages = product.images.map((image) => image.mediaAsset.url);

  const colors: StoreProductColor[] = colorSets.length
    ? colorSets.map((set) => ({
        name: set.colorName,
        slug: slugify(set.colorName),
        hex: set.colorHex,
        imageUrls: set.images.map((image) => image.mediaAsset.url),
      }))
    : [
        {
          name: "Padrão",
          slug: "padrao",
          hex: null,
          imageUrls: fallbackImages,
        },
      ];

  colors.forEach((color) => {
    if (color.imageUrls.length === 0) color.imageUrls = fallbackImages;
  });

  const installmentLabel =
    product.basePriceCents >= 30000
      ? `Em até 6x de ${centsToReais(Math.round(product.basePriceCents / 6))} sem juros`
      : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    subtitle: product.subtitle,
    description: product.description,
    category: product.category
      ? {
          name: product.category.name,
          slug: product.category.slug,
          href: product.category.slug
            ? `/categorias/${product.category.slug}`
            : "/",
        }
      : null,
    collection: (() => {
      const featured =
        product.collections?.find((c) => c.isFeatured) ??
        product.collections?.[0];
      return featured
        ? {
            name: featured.name,
            slug: featured.slug,
            href: `/colecoes/${featured.slug}`,
          }
        : null;
    })(),
    priceLabel: centsToReais(product.basePriceCents),
    comparePriceLabel:
      product.compareAtPriceCents && product.compareAtPriceCents > product.basePriceCents
        ? centsToReais(product.compareAtPriceCents)
        : null,
    basePriceCents: product.basePriceCents,
    installmentLabel,
    material: product.material,
    fit: product.fit,
    careInstructions: product.careInstructions,
    colors,
    allImageUrls: fallbackImages,
    primaryImageAlt: product.primaryImage?.altText ?? product.name,
  };
};

export const getSizeOptionsForColor = (
  product: StoreProductOutput,
  colorName: string,
): StoreProductSizeOption[] => {
  const normalized = colorName.trim().toLowerCase();
  const variantsForColor = product.variants.filter(
    (variant) => variant.colorName.trim().toLowerCase() === normalized,
  );

  if (variantsForColor.length === 0) {
    return product.variants.map((variant) => ({
      label: variant.size,
      variantId: variant.id,
      inStock: variant.stockQuantity > 0,
    }));
  }

  const seen = new Map<string, StoreProductSizeOption>();
  variantsForColor.forEach((variant) => {
    const key = variant.size.toLowerCase();
    const existing = seen.get(key);
    if (!existing || (!existing.inStock && variant.stockQuantity > 0)) {
      seen.set(key, {
        label: variant.size,
        variantId: variant.id,
        inStock: variant.stockQuantity > 0,
      });
    }
  });
  return Array.from(seen.values());
};

export const findVariant = (
  product: StoreProductOutput,
  colorName: string,
  size: string | null,
) => {
  const normalizedColor = colorName.trim().toLowerCase();
  return (
    product.variants.find(
      (variant) =>
        variant.colorName.trim().toLowerCase() === normalizedColor &&
        (size ? variant.size.toLowerCase() === size.toLowerCase() : true),
    ) ?? null
  );
};

export const buildVariantPriceLabel = (
  product: StoreProductOutput,
  variant: ReturnType<typeof findVariant>,
) => {
  const priceCents = variant?.priceCents ?? product.basePriceCents;
  const compareCents =
    variant?.compareAtPriceCents ?? product.compareAtPriceCents;
  return {
    price: centsToReais(priceCents),
    compareAt:
      compareCents && compareCents > priceCents
        ? centsToReais(compareCents)
        : null,
  };
};

export type RelatedProductCardData = {
  href: string;
  name: string;
  category?: string;
  price: string;
  comparePrice?: string;
  image: string;
  hoverImage?: string;
};

export const buildRelatedProductCard = (
  item: StoreRelatedProductItem,
): RelatedProductCardData | null => {
  if (!item.primaryImage) return null;

  return {
    href: `/products/${item.slug}`,
    name: item.name,
    category: item.category?.name,
    price: centsToReais(item.basePriceCents),
    comparePrice:
      item.compareAtPriceCents && item.compareAtPriceCents > item.basePriceCents
        ? centsToReais(item.compareAtPriceCents)
        : undefined,
    image: item.primaryImage.url,
    hoverImage: item.hoverImage?.url,
  };
};
