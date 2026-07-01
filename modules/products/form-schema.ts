import { z } from "zod";
import { parseReaisInput } from "@/modules/products/form-utils";

const requiredDecimal = (label: string) =>
  z
    .union([z.string(), z.number()])
    .transform((value) =>
      typeof value === "number" ? value / 100 : value.trim(),
    )
    .refine((value) => value !== "" && value !== null, {
      message: `${label} é obrigatório`,
    })
    .refine(
      (value) =>
        typeof value === "number"
          ? Number.isFinite(value)
          : parseReaisInput(value) !== null,
      {
        message: `${label} deve ser um número válido`,
      },
    )
    .transform((value) =>
      typeof value === "number" ? value : (parseReaisInput(value) ?? 0),
    )
    .refine((value) => value >= 0, {
      message: `${label} não pode ser negativo`,
    });

const optionalDecimal = (label: string) =>
  z
    .union([z.string(), z.number()])
    .transform((value) =>
      typeof value === "number" ? value / 100 : value.trim(),
    )
    .refine(
      (value) =>
        typeof value === "number" || !value || parseReaisInput(value) !== null,
      {
        message: `${label} deve ser um número válido`,
      },
    )
    .transform((value) =>
      typeof value === "number" ? value : parseReaisInput(value),
    )
    .refine((value) => value === null || value >= 0, {
      message: `${label} não pode ser negativo`,
    });

const requiredInteger = (label: string) =>
  requiredDecimal(label).refine((value) => Number.isInteger(value), {
    message: `${label} deve ser um número inteiro`,
  });

const optionalInteger = (label: string) =>
  optionalDecimal(label).refine(
    (value) => value === null || Number.isInteger(value),
    {
      message: `${label} deve ser um número inteiro`,
    },
  );

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} deve ter no máximo ${max} caracteres`);

const variantFormSchema = z
  .object({
    id: z.string().optional(),
    sku: z
      .string()
      .trim()
      .min(1, "SKU é obrigatório")
      .max(80, "SKU deve ter no máximo 80 caracteres")
      .transform((value) => value.toUpperCase()),
    colorName: z
      .string()
      .trim()
      .min(1, "Cor é obrigatória")
      .max(80, "Cor deve ter no máximo 80 caracteres"),
    colorHex: z
      .string()
      .trim()
      .refine((value) => !value || /^#[0-9a-fA-F]{6}$/.test(value), {
        message: "Use o formato #RRGGBB",
      })
      .transform((value) => value.toUpperCase()),
    size: z
      .string()
      .trim()
      .min(1, "Tamanho é obrigatório")
      .max(40, "Tamanho deve ter no máximo 40 caracteres"),
    price: optionalDecimal("Preço da variante"),
    compareAtPrice: optionalDecimal("Preço de comparação"),
    stockQuantity: requiredInteger("Estoque"),
    lowStockThreshold: requiredInteger("Estoque baixo"),
    weightGrams: optionalInteger("Peso"),
    isActive: z.boolean(),
  })
  .refine(
    ({ price, compareAtPrice }) =>
      compareAtPrice === null || price === null || compareAtPrice >= price,
    {
      path: ["compareAtPrice"],
      message: "Preço de comparação deve ser maior ou igual ao preço",
    },
  );

export const productFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nome do produto é obrigatório")
      .max(160, "Nome deve ter no máximo 160 caracteres"),
    subtitle: optionalText(180, "Subtítulo"),
    description: optionalText(8000, "Descrição"),
    status: z.enum(["draft", "active", "archived"]),
    categoryId: z.string().nullable(),
    collectionIds: z.array(z.string()),
    basePrice: requiredDecimal("Preço base"),
    compareAtPrice: optionalDecimal("Preço de comparação"),
    cost: optionalDecimal("Custo interno"),
    currency: z.string().trim().length(3).default("BRL"),
    isFeatured: z.boolean(),
    material: optionalText(500, "Material"),
    fit: optionalText(500, "Modelagem"),
    careInstructions: optionalText(1000, "Cuidados"),
    heightCm: optionalInteger("Altura"),
    widthCm: optionalInteger("Largura"),
    lengthCm: optionalInteger("Comprimento"),
    seoTitle: optionalText(160, "Título SEO"),
    seoDescription: optionalText(300, "Descrição SEO"),
    variants: z
      .array(variantFormSchema)
      .min(1, "Produto deve ter pelo menos uma variante")
      .max(200, "Produto pode ter no máximo 200 variantes"),
  })
  .refine(
    ({ basePrice, compareAtPrice }) =>
      compareAtPrice === null || compareAtPrice >= basePrice,
    {
      path: ["compareAtPrice"],
      message: "Preço de comparação deve ser maior ou igual ao preço base",
    },
  );

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;
export type VariantFormInput = ProductFormInput["variants"][number];
