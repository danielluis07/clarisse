import { z } from "zod";
import { PAGINATION } from "@/constants";

export const categorySortBySchema = z.enum([
  "createdAt",
  "updatedAt",
  "name",
  "displayOrder",
]);
export const categorySortOrderSchema = z.enum(["asc", "desc"]);

const isoDate = z.iso.date({ message: "Data inválida" });

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();

const categoryBaseInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome da categoria é obrigatório")
    .max(120, "Nome da categoria deve ter no máximo 120 caracteres"),
  description: optionalText,
  imageId: optionalText,
  isActive: z.boolean().default(true),
  displayOrder: z
    .number()
    .int("Ordem de exibição deve ser um número inteiro")
    .min(0, "Ordem de exibição não pode ser negativa")
    .default(0),
  seoTitle: optionalText,
  seoDescription: optionalText,
});

export const listCategoriesInput = z
  .object({
    page: z.number().min(1).default(1),
    perPage: z.number().min(1).max(100).default(PAGINATION.DEFAULT_PER_PAGE),
    search: z.string().optional(),
    sortBy: categorySortBySchema.default("displayOrder"),
    sortOrder: categorySortOrderSchema.default("asc"),
    isActive: z.boolean().optional(),
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

export const getCategoryInput = z.object({
  id: z.string().min(1, "ID da categoria é obrigatório"),
});

export const createCategoryInput = categoryBaseInput;

export const categoryUpdateFields = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome da categoria é obrigatório")
    .max(120, "Nome da categoria deve ter no máximo 120 caracteres")
    .optional(),
  description: optionalText,
  imageId: optionalText,
  isActive: z.boolean().optional(),
  displayOrder: z
    .number()
    .int("Ordem de exibição deve ser um número inteiro")
    .min(0, "Ordem de exibição não pode ser negativa")
    .optional(),
  seoTitle: optionalText,
  seoDescription: optionalText,
});

export const updateCategoryInput = categoryUpdateFields.extend({
  id: z.string().min(1, "ID da categoria é obrigatório"),
});

export const deleteCategoryInput = z.object({
  id: z.string().min(1, "ID da categoria é obrigatório"),
});

const booleanSearchParam = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const categoriesSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  search: z.string().optional(),
  sortBy: categorySortBySchema.optional(),
  sortOrder: categorySortOrderSchema.optional(),
  isActive: booleanSearchParam.optional(),
  createdAtFrom: isoDate.optional(),
  createdAtTo: isoDate.optional(),
});
