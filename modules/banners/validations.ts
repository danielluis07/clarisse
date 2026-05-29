import { z } from "zod";

import { PAGINATION } from "@/constants";
import { isoDate } from "@/validations";

export const bannerPlacements = [
  "home_hero",
  "home_featured",
  "collection_page",
  "category_page",
  "product_page",
  "promotional",
  "editorial",
] as const;

export const contentStatuses = ["draft", "active", "archived"] as const;

export const bannerPlacementSchema = z.enum(bannerPlacements);
export const contentStatusSchema = z.enum(contentStatuses);

export const bannerSortBySchema = z.enum([
  "createdAt",
  "updatedAt",
  "title",
  "placement",
  "status",
]);
export const bannerSortOrderSchema = z.enum(["asc", "desc"]);

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();

const optionalCtaUrl = z
  .string()
  .trim()
  .max(2048, "URL do CTA deve ter no máximo 2048 caracteres")
  .refine(
    (value) =>
      !value ||
    (value.startsWith("/") && !value.startsWith("//")) ||
      value.startsWith("https://") ||
      value.startsWith("http://"),
    "URL do CTA deve ser relativa ou começar com http:// ou https://",
  )
  .transform((value) => value || null)
  .nullable()
  .optional();

// Focal point coordinate (percent) used as `object-position` when the hero
// image is cropped. Defaults to center.
const focalCoord = z
  .number()
  .int("Ponto focal deve ser um número inteiro")
  .min(0, "Ponto focal deve estar entre 0 e 100")
  .max(100, "Ponto focal deve estar entre 0 e 100")
  .default(50);

const bannerBaseInput = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Título do banner é obrigatório")
      .max(160, "Título do banner deve ter no máximo 160 caracteres"),
    subtitle: optionalText,
    description: z
      .string()
      .trim()
      .max(1000, "Descrição deve ter no máximo 1000 caracteres")
      .transform((value) => value || null)
      .nullable()
      .optional(),
    imageId: optionalText,
    mobileImageId: optionalText,
    ctaLabel: z
      .string()
      .trim()
      .max(80, "Texto do CTA deve ter no máximo 80 caracteres")
      .transform((value) => value || null)
      .nullable()
      .optional(),
    ctaUrl: optionalCtaUrl,
    placement: bannerPlacementSchema,
    status: contentStatusSchema.default("draft"),
    focalX: focalCoord,
    focalY: focalCoord,
    mobileFocalX: focalCoord,
    mobileFocalY: focalCoord,
  });

export const listBannersInput = z
  .object({
    page: z.number().min(1).default(1),
    perPage: z.number().min(1).max(100).default(PAGINATION.DEFAULT_PER_PAGE),
    search: z.string().trim().optional(),
    sortBy: bannerSortBySchema.default("updatedAt"),
    sortOrder: bannerSortOrderSchema.default("desc"),
    placement: bannerPlacementSchema.optional(),
    status: contentStatusSchema.optional(),
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

export const listStoreBannersInput = z.object({
  placement: bannerPlacementSchema.optional(),
  limit: z.number().int().min(1).max(24).optional(),
});

export const getBannerInput = z.object({
  id: z.string().min(1, "ID do banner é obrigatório"),
});

export const createBannerInput = bannerBaseInput;

export const bannerUpdateFields = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Título do banner é obrigatório")
      .max(160, "Título do banner deve ter no máximo 160 caracteres")
      .optional(),
    subtitle: optionalText,
    description: z
      .string()
      .trim()
      .max(1000, "Descrição deve ter no máximo 1000 caracteres")
      .transform((value) => value || null)
      .nullable()
      .optional(),
    imageId: optionalText,
    mobileImageId: optionalText,
    ctaLabel: z
      .string()
      .trim()
      .max(80, "Texto do CTA deve ter no máximo 80 caracteres")
      .transform((value) => value || null)
      .nullable()
      .optional(),
    ctaUrl: optionalCtaUrl,
    placement: bannerPlacementSchema.optional(),
    status: contentStatusSchema.optional(),
    focalX: focalCoord.optional(),
    focalY: focalCoord.optional(),
    mobileFocalX: focalCoord.optional(),
    mobileFocalY: focalCoord.optional(),
  });

export const updateBannerInput = bannerUpdateFields.extend({
  id: z.string().min(1, "ID do banner é obrigatório"),
});

export const deleteBannerInput = z.object({
  id: z.string().min(1, "ID do banner é obrigatório"),
});

export const deleteBannersInput = z.object({
  ids: z.array(z.string().min(1)).min(1, "Informe pelo menos um banner"),
});

const booleanSearchParam = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const bannersSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  search: z.string().optional(),
  sortBy: bannerSortBySchema.optional(),
  sortOrder: bannerSortOrderSchema.optional(),
  placement: bannerPlacementSchema.optional(),
  status: contentStatusSchema.optional(),
  isActive: booleanSearchParam.optional(),
  createdAtFrom: isoDate.optional(),
  createdAtTo: isoDate.optional(),
});
