import { z } from "zod";

import { MAX_FILE_SIZE_BYTES } from "@/constants";
import { TEMPORARY_PRODUCT_IMAGE_ANALYSIS_PURPOSE } from "@/modules/media/constants";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const allowedImageMimeTypeSchema = z.enum(ALLOWED_IMAGE_MIME_TYPES);

export const mediaFolderSchema = z
  .string()
  .trim()
  .min(1, "Pasta de destino é obrigatória")
  .max(80, "Pasta de destino muito longa")
  .regex(/^[a-zA-Z0-9._/-]+$/, "Pasta de destino contém caracteres inválidos");

export const createPresignedUploadInput = z.object({
  filename: z.string().trim().min(1, "Nome do arquivo é obrigatório").max(255),
  mimeType: allowedImageMimeTypeSchema,
  sizeBytes: z
    .number()
    .int("Tamanho do arquivo inválido")
    .min(1, "Arquivo inválido")
    .max(
      MAX_FILE_SIZE_BYTES.value,
      `Arquivo muito grande. Tamanho máximo permitido: ${MAX_FILE_SIZE_BYTES.label}`,
    ),
  folder: mediaFolderSchema,
});

export const registerAssetInput = z.object({
  key: z.string().trim().min(1),
  url: z.url(),
  filename: z.string().trim().min(1).max(255),
  mimeType: allowedImageMimeTypeSchema,
  sizeBytes: z.number().int().min(1).max(MAX_FILE_SIZE_BYTES.value),
  width: z.number().int().min(0).nullable().optional(),
  height: z.number().int().min(0).nullable().optional(),
  altText: z.string().trim().max(255).nullable().optional(),
  metadata: z
    .object({
      temporary: z.literal(true),
      purpose: z.literal(TEMPORARY_PRODUCT_IMAGE_ANALYSIS_PURPOSE),
      sessionId: z.string().trim().min(1).max(120),
      expiresAt: z.string().trim().min(1).max(80),
    })
    .nullable()
    .optional(),
});

export const deleteAssetInput = z.object({
  id: z.string().min(1, "ID do asset é obrigatório"),
});

export const getAssetInput = z.object({
  id: z.string().min(1, "ID do asset é obrigatório"),
});

export const getAssetsByIdsInput = z.object({
  ids: z.array(z.string().min(1)).max(50),
});
