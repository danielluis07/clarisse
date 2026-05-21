import type { ProductImageSlot } from "@/components/media/product-images-field";
import { centsToReais } from "@/lib/utils";
import type { ProductOutput } from "@/modules/products/types";
import type {
  ProductFormInput,
  ProductFormOutput,
  VariantFormInput,
} from "@/modules/products/form-schema";
import type { ProductImageColorOption } from "@/modules/media/types";

export const parseReaisInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/[^\d,.-]/g, "");
  const hasComma = cleaned.includes(",");
  const normalized = hasComma
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};

export const getProductFormErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Não foi possível salvar o produto.";

export const toAmountInput = (cents?: number | null) =>
  cents == null ? "" : centsToReais(cents);

const toCents = (value: number) => Math.round(value * 100);
const toNullableCents = (value: number | null) =>
  value == null ? null : toCents(value);

const toNullableText = (value: string) => value.trim() || null;

export const defaultVariant = (): VariantFormInput => ({
  sku: "",
  colorName: "Default",
  colorHex: "",
  size: "One Size",
  price: "",
  compareAtPrice: "",
  stockQuantity: "0",
  lowStockThreshold: "5",
  weightGrams: "",
  isActive: true,
});

export const getProductFormDefaultValues = (
  product?: ProductOutput,
): ProductFormInput => ({
  name: product?.name ?? "",
  subtitle: product?.subtitle ?? "",
  description: product?.description ?? "",
  status: product?.status ?? "draft",
  categoryId: product?.categoryId ?? null,
  collectionIds: product?.collections.map((collection) => collection.id) ?? [],
  basePrice: toAmountInput(product?.basePriceCents),
  compareAtPrice: toAmountInput(product?.compareAtPriceCents),
  cost: toAmountInput(product?.costCents),
  currency: product?.currency ?? "BRL",
  isFeatured: product?.isFeatured ?? false,
  material: product?.material ?? "",
  fit: product?.fit ?? "",
  careInstructions: product?.careInstructions ?? "",
  seoTitle: product?.seoTitle ?? "",
  seoDescription: product?.seoDescription ?? "",
  variants: product?.variants.length
    ? product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        colorName: variant.colorName,
        colorHex: variant.colorHex ?? "",
        size: variant.size,
        price: toAmountInput(variant.priceCents),
        compareAtPrice: toAmountInput(variant.compareAtPriceCents),
        stockQuantity: String(variant.stockQuantity),
        lowStockThreshold: String(variant.lowStockThreshold),
        weightGrams:
          variant.weightGrams == null ? "" : String(variant.weightGrams),
        isActive: variant.isActive,
      }))
    : [defaultVariant()],
});

export const productImagesToSlots = (
  product?: ProductOutput,
): ProductImageSlot[] => {
  if (!product) return [];

  return product.images.map((image) => ({
    selection: {
      kind: "existing",
      localId: image.id,
      assetId: image.mediaAssetId,
      url: image.mediaAsset.url,
      filename: image.mediaAsset.filename,
      altText: image.altText ?? image.mediaAsset.altText,
    },
    draft: {
      localId: image.id,
      assetId: image.mediaAssetId,
      colorName: image.colorName,
      colorHex: image.colorHex,
      altText: image.altText ?? image.mediaAsset.altText,
      position: image.position,
      isPrimary: image.isPrimary,
    },
  }));
};

export const buildProductPayload = (
  values: ProductFormOutput,
  images: Array<{
    mediaAssetId: string;
    colorName: string | null;
    colorHex: string | null;
    altText: string | null;
    position: number;
    isPrimary: boolean;
  }>,
) => ({
  name: values.name,
  subtitle: toNullableText(values.subtitle),
  description: toNullableText(values.description),
  status: values.status,
  categoryId: values.categoryId,
  collectionIds: values.collectionIds,
  basePriceCents: toCents(values.basePrice),
  compareAtPriceCents: toNullableCents(values.compareAtPrice),
  costCents: toNullableCents(values.cost),
  currency: values.currency,
  isFeatured: values.isFeatured,
  material: toNullableText(values.material),
  fit: toNullableText(values.fit),
  careInstructions: toNullableText(values.careInstructions),
  seoTitle: toNullableText(values.seoTitle),
  seoDescription: toNullableText(values.seoDescription),
  variants: values.variants.map((variant, index) => ({
    id: variant.id,
    sku: variant.sku,
    colorName: variant.colorName,
    colorHex: toNullableText(variant.colorHex),
    size: variant.size,
    priceCents: toNullableCents(variant.price),
    compareAtPriceCents: toNullableCents(variant.compareAtPrice),
    stockQuantity: variant.stockQuantity,
    lowStockThreshold: variant.lowStockThreshold,
    weightGrams: variant.weightGrams,
    isActive: variant.isActive,
    displayOrder: index,
  })),
  images,
});

export const normalizeSkuPart = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const parseColorToken = (token: string) => {
  const hex = token.match(/#[0-9a-fA-F]{6}/)?.[0].toUpperCase() ?? "";
  const name = token.replace(/#[0-9a-fA-F]{6}/, "").trim();

  return {
    colorName: name || "Default",
    colorHex: hex,
  };
};

export const splitTokens = (value: string) =>
  value
    .split(/[\n,]+/g)
    .map((item) => item.trim())
    .filter(Boolean);

export const getVariantColorOptions = (
  variants: VariantFormInput[] = [],
): ProductImageColorOption[] => {
  const colors = new Map<string, ProductImageColorOption>();

  variants.forEach((variant) => {
    const colorName = variant.colorName.trim();
    if (!colorName) return;

    const colorKey = colorName.toLowerCase();
    const colorHex = variant.colorHex?.trim() || null;
    const existing = colors.get(colorKey);

    if (!existing || (!existing.colorHex && colorHex)) {
      colors.set(colorKey, { colorName, colorHex });
    }
  });

  return Array.from(colors.values());
};
