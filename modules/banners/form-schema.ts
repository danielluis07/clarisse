import { z } from "zod";

import {
  bannerPlacementSchema,
  contentStatusSchema,
} from "@/modules/banners/validations";

const optionalTextField = z
  .string()
  .trim()
  .transform((value) => value || null);

const optionalCtaUrlField = z
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
  .transform((value) => value || null);

export const bannerFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Título do banner é obrigatório")
    .max(160, "Título do banner deve ter no máximo 160 caracteres"),
  subtitle: optionalTextField,
  description: z
    .string()
    .trim()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .transform((value) => value || null),
  ctaLabel: z
    .string()
    .trim()
    .max(80, "Texto do CTA deve ter no máximo 80 caracteres")
    .transform((value) => value || null),
  ctaUrl: optionalCtaUrlField,
  placement: bannerPlacementSchema,
  status: contentStatusSchema,
});

export type BannerFormInput = z.input<typeof bannerFormSchema>;
export type BannerFormOutput = z.output<typeof bannerFormSchema>;
