import { z } from "zod";

import { PAGINATION } from "@/constants";

export const productStatusSchema = z.enum(["draft", "active", "archived"]);
export const productSortBySchema = z.enum([
  "createdAt",
  "updatedAt",
  "publishedAt",
  "name",
  "status",
  "basePriceCents",
]);
export const productSortOrderSchema = z.enum(["asc", "desc"]);

export const inventoryStockStatusSchema = z.enum([
  "in_stock",
  "low_stock",
  "out_of_stock",
]);
export const inventorySortBySchema = z.enum([
  "productName",
  "sku",
  "stockQuantity",
  "updatedAt",
  "displayOrder",
]);
export const inventoryMovementTypeSchema = z.enum([
  "adjustment",
  "restock",
  "sale",
  "return",
  "correction",
]);

const isoDate = z.iso.date({ message: "Data inválida" });

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || null)
    .nullable()
    .optional();

const optionalId = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();

const moneyCents = (field: string) =>
  z
    .number()
    .int(`${field} deve ser um número inteiro em centavos`)
    .min(0, `${field} não pode ser negativo`);

const optionalMoneyCents = (field: string) =>
  moneyCents(field).nullable().optional();

const currencySchema = z
  .string()
  .trim()
  .length(3, "Moeda deve usar o código ISO de 3 letras")
  .transform((value) => value.toUpperCase())
  .default("BRL");

const colorHexSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Cor deve estar no formato #RRGGBB")
  .transform((value) => value.toUpperCase())
  .nullable()
  .optional();

const booleanSearchParam = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const uniqueStringArray = (message: string) =>
  z.array(z.string().trim().min(1)).superRefine((values, ctx) => {
    const seen = new Map<string, number>();

    values.forEach((value, index) => {
      const firstIndex = seen.get(value);
      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: [index],
          message,
        });
        ctx.addIssue({
          code: "custom",
          path: [firstIndex],
          message,
        });
        return;
      }
      seen.set(value, index);
    });
  });

const productVariantFields = z.object({
    sku: z
      .string()
      .trim()
      .min(1, "SKU é obrigatório")
      .max(80, "SKU deve ter no máximo 80 caracteres")
      .transform((value) => value.toUpperCase()),
    colorName: z
      .string()
      .trim()
      .min(1, "Nome da cor é obrigatório")
      .max(80, "Nome da cor deve ter no máximo 80 caracteres")
      .default("Default"),
    colorHex: colorHexSchema,
    size: z
      .string()
      .trim()
      .min(1, "Tamanho é obrigatório")
      .max(40, "Tamanho deve ter no máximo 40 caracteres")
      .default("One Size"),
    priceCents: optionalMoneyCents("Preço da variante"),
    compareAtPriceCents: optionalMoneyCents("Preço de comparação da variante"),
    stockQuantity: z
      .number()
      .int("Estoque deve ser um número inteiro")
      .min(0, "Estoque não pode ser negativo")
      .default(0),
    lowStockThreshold: z
      .number()
      .int("Limite de estoque baixo deve ser um número inteiro")
      .min(0, "Limite de estoque baixo não pode ser negativo")
      .default(5),
    weightGrams: z
      .number()
      .int("Peso deve ser um número inteiro")
      .min(0, "Peso não pode ser negativo")
      .nullable()
      .optional(),
    isActive: z.boolean().default(true),
  displayOrder: z
    .number()
    .int("Ordem da variante deve ser um número inteiro")
    .min(0, "Ordem da variante não pode ser negativa")
    .optional(),
});

const productVariantBaseInput = productVariantFields
  .refine(
    ({ priceCents, compareAtPriceCents }) =>
      compareAtPriceCents == null ||
      priceCents == null ||
      compareAtPriceCents >= priceCents,
    {
      path: ["compareAtPriceCents"],
      message: "Preço de comparação deve ser maior ou igual ao preço",
    },
  );

const uniqueVariants = <
  T extends { sku?: string; colorName?: string; size?: string },
>(
  variants: T[],
  ctx: z.RefinementCtx,
) => {
  const seenSkus = new Map<string, number>();
  const seenOptions = new Map<string, number>();

  variants.forEach((variant, index) => {
    if (variant.sku) {
      const firstIndex = seenSkus.get(variant.sku);
      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: [index, "sku"],
          message: "SKU duplicado",
        });
        ctx.addIssue({
          code: "custom",
          path: [firstIndex, "sku"],
          message: "SKU duplicado",
        });
      } else {
        seenSkus.set(variant.sku, index);
      }
    }

    if (variant.colorName && variant.size) {
      const optionKey = `${variant.colorName.toLowerCase()}::${variant.size.toLowerCase()}`;
      const firstIndex = seenOptions.get(optionKey);
      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: [index, "size"],
          message: "Combinação de cor e tamanho duplicada",
        });
        ctx.addIssue({
          code: "custom",
          path: [firstIndex, "size"],
          message: "Combinação de cor e tamanho duplicada",
        });
      } else {
        seenOptions.set(optionKey, index);
      }
    }
  });
};

const productImageInput = z.object({
  mediaAssetId: z.string().trim().min(1, "Asset da imagem é obrigatório"),
  variantId: optionalId,
  variantSku: optionalId,
  altText: optionalText(
    255,
    "Texto alternativo deve ter no máximo 255 caracteres",
  ),
  position: z
    .number()
    .int("Posição da imagem deve ser um número inteiro")
    .min(0, "Posição da imagem não pode ser negativa")
    .optional(),
  isPrimary: z.boolean().default(false),
});

const productImagesInput = z
  .array(productImageInput)
  .max(12, "Um produto pode ter no máximo 12 imagens")
  .superRefine((images, ctx) => {
    const mediaIds = new Map<string, number>();
    let primaryCount = 0;

    images.forEach((image, index) => {
      const firstIndex = mediaIds.get(image.mediaAssetId);
      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: [index, "mediaAssetId"],
          message: "Imagem duplicada neste produto",
        });
        ctx.addIssue({
          code: "custom",
          path: [firstIndex, "mediaAssetId"],
          message: "Imagem duplicada neste produto",
        });
      } else {
        mediaIds.set(image.mediaAssetId, index);
      }

      if (image.isPrimary) primaryCount += 1;
    });

    if (primaryCount > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["isPrimary"],
        message: "Apenas uma imagem pode ser marcada como capa",
      });
    }
  });

const collectionIdsInput = uniqueStringArray("Coleção duplicada").max(
  50,
  "Um produto pode pertencer a no máximo 50 coleções",
);

const productBaseFields = z.object({
    name: z
      .string()
      .trim()
      .min(1, "Nome do produto é obrigatório")
      .max(160, "Nome do produto deve ter no máximo 160 caracteres"),
    subtitle: optionalText(
      180,
      "Subtítulo deve ter no máximo 180 caracteres",
    ),
    description: optionalText(
      8000,
      "Descrição deve ter no máximo 8000 caracteres",
    ),
    status: productStatusSchema.default("draft"),
    categoryId: optionalId,
    basePriceCents: moneyCents("Preço base"),
    compareAtPriceCents: optionalMoneyCents("Preço de comparação"),
    costCents: optionalMoneyCents("Custo interno"),
    currency: currencySchema,
    isFeatured: z.boolean().default(false),
    material: optionalText(500, "Material deve ter no máximo 500 caracteres"),
    fit: optionalText(500, "Modelagem deve ter no máximo 500 caracteres"),
    careInstructions: optionalText(
      1000,
      "Cuidados devem ter no máximo 1000 caracteres",
    ),
    seoTitle: optionalText(160, "Título SEO deve ter no máximo 160 caracteres"),
  seoDescription: optionalText(
    300,
    "Descrição SEO deve ter no máximo 300 caracteres",
  ),
});

export const createProductInput = productBaseFields
  .extend({
    collectionIds: collectionIdsInput.default([]),
    variants: z
      .array(productVariantBaseInput)
      .min(1, "Produto deve ter pelo menos uma variante")
      .max(200, "Produto pode ter no máximo 200 variantes")
      .superRefine(uniqueVariants),
    images: productImagesInput.default([]),
  })
  .refine(
    ({ basePriceCents, compareAtPriceCents }) =>
      compareAtPriceCents == null || compareAtPriceCents >= basePriceCents,
    {
      path: ["compareAtPriceCents"],
      message: "Preço de comparação deve ser maior ou igual ao preço base",
    },
  );

const productUpdateFieldsBase = z.object({
    name: z
      .string()
      .trim()
      .min(1, "Nome do produto é obrigatório")
      .max(160, "Nome do produto deve ter no máximo 160 caracteres")
      .optional(),
    subtitle: optionalText(
      180,
      "Subtítulo deve ter no máximo 180 caracteres",
    ),
    description: optionalText(
      8000,
      "Descrição deve ter no máximo 8000 caracteres",
    ),
    status: productStatusSchema.optional(),
    categoryId: optionalId,
    basePriceCents: moneyCents("Preço base").optional(),
    compareAtPriceCents: optionalMoneyCents("Preço de comparação"),
    costCents: optionalMoneyCents("Custo interno"),
    currency: currencySchema.optional(),
    isFeatured: z.boolean().optional(),
    material: optionalText(500, "Material deve ter no máximo 500 caracteres"),
    fit: optionalText(500, "Modelagem deve ter no máximo 500 caracteres"),
    careInstructions: optionalText(
      1000,
      "Cuidados devem ter no máximo 1000 caracteres",
    ),
    seoTitle: optionalText(160, "Título SEO deve ter no máximo 160 caracteres"),
  seoDescription: optionalText(
    300,
    "Descrição SEO deve ter no máximo 300 caracteres",
  ),
});

export const productUpdateFields = productUpdateFieldsBase
  .refine(
    ({ basePriceCents, compareAtPriceCents }) =>
      compareAtPriceCents == null ||
      basePriceCents == null ||
      compareAtPriceCents >= basePriceCents,
    {
      path: ["compareAtPriceCents"],
      message: "Preço de comparação deve ser maior ou igual ao preço base",
    },
  );

export const updateProductInput = productUpdateFieldsBase
  .extend({
    id: z.string().min(1, "ID do produto é obrigatório"),
    collectionIds: collectionIdsInput.optional(),
    images: productImagesInput.optional(),
  })
  .refine(
    ({ basePriceCents, compareAtPriceCents }) =>
      compareAtPriceCents == null ||
      basePriceCents == null ||
      compareAtPriceCents >= basePriceCents,
    {
      path: ["compareAtPriceCents"],
      message: "Preço de comparação deve ser maior ou igual ao preço base",
    },
  );

export const listProductsInput = z
  .object({
    page: z.number().min(1).default(1),
    perPage: z.number().min(1).max(100).default(PAGINATION.DEFAULT_PER_PAGE),
    search: z.string().trim().optional(),
    sortBy: productSortBySchema.default("createdAt"),
    sortOrder: productSortOrderSchema.default("desc"),
    status: productStatusSchema.optional(),
    categoryId: z.string().trim().min(1).optional(),
    collectionId: z.string().trim().min(1).optional(),
    isFeatured: z.boolean().optional(),
    createdAtFrom: isoDate.optional(),
    createdAtTo: isoDate.optional(),
  })
  .refine(
    ({ createdAtFrom, createdAtTo }) =>
      !createdAtFrom || !createdAtTo || createdAtFrom <= createdAtTo,
    {
      path: ["createdAtTo"],
      message: "`createdAtTo` deve ser maior ou igual a `createdAtFrom`",
    },
  );

export const getProductInput = z.object({
  id: z.string().min(1, "ID do produto é obrigatório"),
});

export const deleteProductInput = z.object({
  id: z.string().min(1, "ID do produto é obrigatório"),
});

export const deleteProductsInput = z.object({
  ids: z.array(z.string().min(1)).min(1, "Nenhum produto selecionado"),
});

export const createProductVariantInput = productVariantFields
  .extend({
    productId: z.string().min(1, "ID do produto é obrigatório"),
  })
  .refine(
    ({ priceCents, compareAtPriceCents }) =>
      compareAtPriceCents == null ||
      priceCents == null ||
      compareAtPriceCents >= priceCents,
    {
      path: ["compareAtPriceCents"],
      message: "Preço de comparação deve ser maior ou igual ao preço",
    },
  );

export const updateProductVariantInput = productVariantFields
  .partial()
  .extend({
    id: z.string().min(1, "ID da variante é obrigatório"),
  })
  .refine(
    ({ priceCents, compareAtPriceCents }) =>
      compareAtPriceCents == null ||
      priceCents == null ||
      compareAtPriceCents >= priceCents,
    {
      path: ["compareAtPriceCents"],
      message: "Preço de comparação deve ser maior ou igual ao preço",
    },
  );

export const replaceProductVariantsInput = z.object({
  productId: z.string().min(1, "ID do produto é obrigatório"),
  variants: z
    .array(
      productVariantFields
        .extend({
          id: z.string().min(1).optional(),
        })
        .refine(
          ({ priceCents, compareAtPriceCents }) =>
            compareAtPriceCents == null ||
            priceCents == null ||
            compareAtPriceCents >= priceCents,
          {
            path: ["compareAtPriceCents"],
            message: "Preço de comparação deve ser maior ou igual ao preço",
          },
        ),
    )
    .min(1, "Produto deve ter pelo menos uma variante")
    .max(200, "Produto pode ter no máximo 200 variantes")
    .superRefine(uniqueVariants),
});

export const deleteProductVariantInput = z.object({
  id: z.string().min(1, "ID da variante é obrigatório"),
});

export const listInventoryInput = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(PAGINATION.DEFAULT_PER_PAGE),
  search: z.string().trim().optional(),
  sortBy: inventorySortBySchema.default("updatedAt"),
  sortOrder: productSortOrderSchema.default("desc"),
  productId: z.string().trim().min(1).optional(),
  categoryId: z.string().trim().min(1).optional(),
  status: productStatusSchema.optional(),
  isActive: z.boolean().optional(),
  stockStatus: inventoryStockStatusSchema.optional(),
});

export const adjustInventoryInput = z.object({
  productVariantId: z.string().min(1, "ID da variante é obrigatório"),
  quantityDelta: z
    .number()
    .int("Ajuste de estoque deve ser um número inteiro")
    .refine((value) => value !== 0, {
      message: "Ajuste de estoque não pode ser zero",
    }),
  type: inventoryMovementTypeSchema.default("adjustment"),
  reason: optionalText(500, "Motivo deve ter no máximo 500 caracteres"),
  referenceType: optionalText(
    80,
    "Tipo de referência deve ter no máximo 80 caracteres",
  ),
  referenceId: optionalText(
    120,
    "ID de referência deve ter no máximo 120 caracteres",
  ),
});

export const productsSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  search: z.string().optional(),
  sortBy: productSortBySchema.optional(),
  sortOrder: productSortOrderSchema.optional(),
  status: productStatusSchema.optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  isFeatured: booleanSearchParam.optional(),
  createdAtFrom: isoDate.optional(),
  createdAtTo: isoDate.optional(),
});

export const inventorySearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  search: z.string().optional(),
  sortBy: inventorySortBySchema.optional(),
  sortOrder: productSortOrderSchema.optional(),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  status: productStatusSchema.optional(),
  isActive: booleanSearchParam.optional(),
  stockStatus: inventoryStockStatusSchema.optional(),
});
