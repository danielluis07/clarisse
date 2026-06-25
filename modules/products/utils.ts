import { z } from "zod";

import { MAX_FILE_SIZE_BYTES, PAGINATION } from "@/constants";
import { ALLOWED_IMAGE_MIME_TYPES } from "@/modules/media/validations";
import { STORE_PRODUCTS_PER_PAGE } from "@/modules/products/constants";
import type {
  ImageMessagePart,
  InventoryInput,
  ProductAiCatalogOptions,
  ProductAiImageInput,
  ProductsInput,
  StoreProductsInput,
} from "@/modules/products/types";
import {
  imageDescriptorsSchema,
  inventorySearchParamsSchema,
  productsSearchParamsSchema,
  storeProductsSearchParamsSchema,
  type ImageDescriptor,
  type ProductImageAnalysis,
} from "@/modules/products/validations";
import { unique } from "@/lib/utils";

export type ProductsSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type InventorySearchParams = Record<
  string,
  string | string[] | undefined
>;

export type StoreProductsSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type VariantStockState = "in_stock" | "low_stock" | "out_of_stock";

export const normalizeProductsParams = (
  params: Partial<ProductsInput>,
): ProductsInput => ({
  page: params.page ?? PAGINATION.DEFAULT_PAGE,
  perPage: params.perPage ?? PAGINATION.DEFAULT_PER_PAGE,
  search: params.search || undefined,
  sortBy: params.sortBy ?? "createdAt",
  sortOrder: params.sortOrder ?? "desc",
  status: params.status || undefined,
  categoryId: params.categoryId || undefined,
  collectionId: params.collectionId || undefined,
  isFeatured:
    typeof params.isFeatured === "boolean" ? params.isFeatured : undefined,
  createdAtFrom: params.createdAtFrom || undefined,
  createdAtTo: params.createdAtTo || undefined,
});

export const parseProductsSearchParams = (
  params: ProductsSearchParams,
): ProductsInput => {
  const result = productsSearchParamsSchema.safeParse(params);

  return normalizeProductsParams(result.success ? result.data : {});
};

export const normalizeStoreProductsParams = (
  params: Partial<StoreProductsInput>,
): StoreProductsInput => ({
  page: params.page ?? PAGINATION.DEFAULT_PAGE,
  perPage: params.perPage ?? STORE_PRODUCTS_PER_PAGE,
  search: params.search || undefined,
  categoryId: params.categoryId || undefined,
  collectionSlug: params.collectionSlug || undefined,
  isFeatured:
    typeof params.isFeatured === "boolean" ? params.isFeatured : undefined,
  sortBy:
    params.sortBy === "createdAt" ||
    params.sortBy === "publishedAt" ||
    params.sortBy === "name" ||
    params.sortBy === "basePriceCents" ||
    params.sortBy === "random"
      ? params.sortBy
      : "publishedAt",
  sortOrder: params.sortOrder ?? "desc",
});

export const parseStoreProductsSearchParams = (
  params: StoreProductsSearchParams,
) => {
  const result = storeProductsSearchParamsSchema.safeParse(params);

  return normalizeStoreProductsParams(result.success ? result.data : {});
};

export const normalizeInventoryParams = (
  params: Partial<InventoryInput>,
): InventoryInput => ({
  page: params.page ?? PAGINATION.DEFAULT_PAGE,
  perPage: params.perPage ?? PAGINATION.DEFAULT_PER_PAGE,
  search: params.search || undefined,
  sortBy: params.sortBy ?? "updatedAt",
  sortOrder: params.sortOrder ?? "desc",
  productId: params.productId || undefined,
  categoryId: params.categoryId || undefined,
  status: params.status || undefined,
  isActive: typeof params.isActive === "boolean" ? params.isActive : undefined,
  stockStatus: params.stockStatus || undefined,
});

export const parseInventorySearchParams = (
  params: InventorySearchParams,
): InventoryInput => {
  const result = inventorySearchParamsSchema.safeParse(params);

  return normalizeInventoryParams(result.success ? result.data : {});
};

export const getVariantStockState = (
  stockQuantity: number,
  lowStockThreshold: number,
): VariantStockState => {
  if (stockQuantity <= 0) return "out_of_stock";
  if (stockQuantity <= lowStockThreshold) return "low_stock";
  return "in_stock";
};

export const getProductStatusLabel = (
  status: "draft" | "active" | "archived",
) => {
  const labels = {
    draft: "Rascunho",
    active: "Ativo",
    archived: "Arquivado",
  } as const;

  return labels[status];
};

export const getStockStatusLabel = (status: VariantStockState) => {
  const labels = {
    in_stock: "Em estoque",
    low_stock: "Estoque baixo",
    out_of_stock: "Sem estoque",
  } as const;

  return labels[status];
};

export const buildVariantLabel = ({
  colorName,
  size,
}: {
  colorName: string;
  size: string;
}) => {
  if (colorName === "Default" && size === "One Size") return "Padrão";
  if (size === "One Size") return colorName;
  if (colorName === "Default") return size;
  return `${colorName} / ${size}`;
};

// --- AI image analysis helpers ---

export const parseImageDescriptors = (
  formData: FormData,
): ImageDescriptor[] => {
  const raw = formData.get("images");

  if (typeof raw !== "string") {
    throw new Error("Dados das imagens ausentes.");
  }

  try {
    return imageDescriptorsSchema.parse(JSON.parse(raw));
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Dados das imagens inválidos.");
    }

    throw new Error("Não foi possível ler os dados das imagens.");
  }
};

export const getImageInput = async (
  formData: FormData,
  descriptors: ImageDescriptor[],
): Promise<ProductAiImageInput> => {
  const parts: ImageMessagePart[] = [];
  const descriptions: ProductAiImageInput["descriptions"] = [];
  const allowedMimeTypes = new Set<string>(ALLOWED_IMAGE_MIME_TYPES);

  for (const descriptor of descriptors) {
    if (descriptor.kind === "url") {
      parts.push({ type: "image", image: new URL(descriptor.url) });
      descriptions.push({
        imageIndex: descriptor.imageIndex,
        source: "existing_url",
        filename: descriptor.filename,
        altText: descriptor.altText,
      });
      continue;
    }

    const file = formData.get(`image-${descriptor.imageIndex}`);

    if (!(file instanceof File)) {
      throw new Error("Arquivo de imagem ausente.");
    }

    if (!allowedMimeTypes.has(file.type)) {
      throw new Error("Tipo de imagem não permitido.");
    }

    if (file.size <= 0) {
      throw new Error("Arquivo de imagem vazio.");
    }
    if (file.size > MAX_FILE_SIZE_BYTES.value) {
      throw new Error(
        `Imagem muito grande. Máximo: ${MAX_FILE_SIZE_BYTES.label}.`,
      );
    }

    parts.push({
      type: "image",
      image: await file.arrayBuffer(),
      mediaType: file.type,
    });
    descriptions.push({
      imageIndex: descriptor.imageIndex,
      source: "uploaded_file",
      filename: descriptor.filename ?? file.name,
      altText: descriptor.altText,
    });
  }

  if (!parts.length) {
    throw new Error("Envie ao menos uma imagem para análise.");
  }

  return { parts, descriptions };
};

export const buildPrompt = (
  catalogOptions: ProductAiCatalogOptions,
  imageInput: ProductAiImageInput,
) => `
Return suggestions for the existing Clarisse product creation form.

Rules:
- Write all customer-facing content in pt-BR with a premium, minimal, editorial fashion tone.
- Do not return or infer any price, compare-at price, internal cost, sale price, or discount.
- Choose categoryId from the category list only. If no category is clearly appropriate, return null.
- Choose collectionIds from the collection list only. Return an empty array when nothing fits.
- Infer variants from visible colors and product type. Clothing usually uses PP, P, M, G unless the item visibly needs a different grade. Bags and simple accessories should use One Size.
- Keep stockQuantity at 0 unless the image clearly includes inventory information. Use lowStockThreshold 5 by default.
- Use weightGrams only when the product type has a reasonable broad estimate; otherwise return null.
- For imageSuggestions, return exactly one entry for every provided imageIndex, including the final image, with useful alt text, color when identifiable, and exactly one primary image.
- imageSuggestions.colorName must exactly match one of the returned variant colorName values, or be null when no visible color can be identified.

Active categories:
${JSON.stringify(catalogOptions.categories)}

Active collections:
${JSON.stringify(catalogOptions.collections)}

Provided images:
${JSON.stringify(imageInput.descriptions)}
`;

export const sanitizeAnalysis = (
  output: ProductImageAnalysis,
  catalogOptions: ProductAiCatalogOptions,
  descriptors: ImageDescriptor[],
): ProductImageAnalysis => {
  const categoryIds = new Set(catalogOptions.categories.map(({ id }) => id));
  const collectionIds = new Set(catalogOptions.collections.map(({ id }) => id));
  const imageIndices = new Set(descriptors.map(({ imageIndex }) => imageIndex));
  const name = truncate(output.name, 160) || "Produto Clarisse";
  const variants = sanitizeVariants(output.variants, name);
  const imageSuggestions = sanitizeImageSuggestions(
    output.imageSuggestions,
    descriptors,
    name,
    variants,
  );

  return {
    name,
    subtitle: truncate(output.subtitle, 180),
    description: truncate(output.description, 8000),
    categoryId:
      output.categoryId && categoryIds.has(output.categoryId)
        ? output.categoryId
        : null,
    collectionIds: unique(
      output.collectionIds.filter((id) => collectionIds.has(id)),
    ),
    isFeatured: output.isFeatured,
    material: truncate(output.material, 500),
    fit: truncate(output.fit, 500),
    careInstructions: truncate(output.careInstructions, 1000),
    seoTitle:
      truncate(output.seoTitle, 160) || truncate(`${name} | Clarisse`, 160),
    seoDescription: truncate(output.seoDescription, 300),
    variants,
    imageSuggestions: imageSuggestions.filter(({ imageIndex }) =>
      imageIndices.has(imageIndex),
    ),
  };
};

const sanitizeVariants = (
  variants: ProductImageAnalysis["variants"],
  productName: string,
) => {
  const normalizedProduct = normalizeSkuPart(productName) || "PRODUTO";
  const seenSkus = new Set<string>();
  const seenOptions = new Set<string>();
  const sanitized: ProductImageAnalysis["variants"] = [];

  for (const variant of variants) {
    const colorName = truncate(variant.colorName, 80) || "Default";
    const size = truncate(variant.size, 40) || "One Size";
    const optionKey = `${colorName.toLowerCase()}::${size.toLowerCase()}`;

    if (seenOptions.has(optionKey)) continue;
    seenOptions.add(optionKey);

    const fallbackSku = `CLA-${normalizedProduct}-${normalizeSkuPart(colorName) || "COR"}-${normalizeSkuPart(size) || "TAM"}`;
    let skuBase = normalizeSkuPart(variant.sku) || fallbackSku;
    if (!skuBase.startsWith("CLA-")) skuBase = `CLA-${skuBase}`;
    skuBase = truncate(skuBase, 80);

    let sku = skuBase;
    let counter = 1;
    while (seenSkus.has(sku)) {
      const suffix = `-${counter}`;
      sku = `${truncate(skuBase, 80 - suffix.length)}${suffix}`;
      counter++;
    }

    seenSkus.add(sku);
    sanitized.push({
      sku,
      colorName,
      colorHex: normalizeColorHex(variant.colorHex),
      size,
      stockQuantity: clampInteger(variant.stockQuantity, 0, 999999),
      lowStockThreshold: clampInteger(variant.lowStockThreshold, 0, 9999),
      weightGrams:
        variant.weightGrams == null
          ? null
          : clampInteger(variant.weightGrams, 0, 999999),
      isActive: variant.isActive,
    });
  }

  if (sanitized.length) return sanitized;

  return [
    {
      sku: `CLA-${normalizedProduct}-DEFAULT-ONE-SIZE`,
      colorName: "Default",
      colorHex: null,
      size: "One Size",
      stockQuantity: 0,
      lowStockThreshold: 5,
      weightGrams: null,
      isActive: true,
    },
  ];
};

const sanitizeImageSuggestions = (
  suggestions: ProductImageAnalysis["imageSuggestions"],
  descriptors: ImageDescriptor[],
  productName: string,
  variants: ProductImageAnalysis["variants"],
) => {
  const byIndex = new Map<
    number,
    ProductImageAnalysis["imageSuggestions"][number]
  >();
  const colorsByName = new Map<
    string,
    { colorName: string; colorHex: string | null }
  >();
  const colorsByHex = new Map<
    string,
    { colorName: string; colorHex: string | null }
  >();

  variants.forEach((variant) => {
    const colorName = truncate(variant.colorName, 80) || "Default";
    const colorHex = normalizeColorHex(variant.colorHex);
    const color = { colorName, colorHex };
    const nameKey = colorName.toLowerCase();

    if (!colorsByName.has(nameKey)) {
      colorsByName.set(nameKey, color);
    }

    if (colorHex && !colorsByHex.has(colorHex)) {
      colorsByHex.set(colorHex, color);
    }
  });

  const resolveColor = (
    suggestion: ProductImageAnalysis["imageSuggestions"][number],
  ) => {
    const colorName = suggestion.colorName
      ? truncate(suggestion.colorName, 80)
      : null;
    const colorHex = normalizeColorHex(suggestion.colorHex);
    const byName = colorName
      ? colorsByName.get(colorName.toLowerCase())
      : undefined;
    const byHex = colorHex ? colorsByHex.get(colorHex) : undefined;

    return byName ?? byHex ?? null;
  };

  suggestions.forEach((suggestion) => {
    const color = resolveColor(suggestion);

    byIndex.set(suggestion.imageIndex, {
      imageIndex: suggestion.imageIndex,
      colorName: color?.colorName ?? null,
      colorHex: color?.colorHex ?? null,
      altText: truncate(suggestion.altText, 255) || productName,
      isPrimary: suggestion.isPrimary,
    });
  });

  const merged = descriptors.map((descriptor, index) => {
    const suggestion = byIndex.get(descriptor.imageIndex);

    return (
      suggestion ?? {
        imageIndex: descriptor.imageIndex,
        colorName: null,
        colorHex: null,
        altText: `${productName} - imagem ${index + 1}`,
        isPrimary: index === 0,
      }
    );
  });
  const primaryIndex =
    merged.find((suggestion) => suggestion.isPrimary)?.imageIndex ??
    descriptors[0]?.imageIndex;

  return merged.map((suggestion) => ({
    ...suggestion,
    isPrimary: suggestion.imageIndex === primaryIndex,
  }));
};

const normalizeColorHex = (value: string | null) => {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : null;
};

export const normalizeSkuPart = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const truncate = (value: string, maxLength: number) =>
  value.trim().slice(0, maxLength);

const clampInteger = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
};
