import { z } from "zod";

export const listStoreCollectionsInput = z.object({
  limit: z.number().int().min(1).max(48).optional(),
});

export const getStoreCollectionInput = z.object({
  slug: z.string().trim().min(1, "Slug da coleção é obrigatório").max(160),
});
