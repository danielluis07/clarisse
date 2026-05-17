import { z } from "zod";
import { PAGINATION } from "@/constants";

export const customerSortBySchema = z.enum(["createdAt", "updatedAt", "name"]);
export const customerSortOrderSchema = z.enum(["asc", "desc"]);

const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Data inválida",
  });

export const listCustomersInput = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(PAGINATION.DEFAULT_PER_PAGE),
  search: z.string().optional(),
  sortBy: customerSortBySchema.default("createdAt"),
  sortOrder: customerSortOrderSchema.default("desc"),
  createdAtFrom: isoDate.optional(),
  createdAtTo: isoDate.optional(),
});

export const getCustomerInput = z.object({
  id: z.string().min(1, "ID do cliente é obrigatório"),
});

export const customersSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  search: z.string().optional(),
  sortBy: customerSortBySchema.optional(),
  sortOrder: customerSortOrderSchema.optional(),
  createdAtFrom: isoDate.optional(),
  createdAtTo: isoDate.optional(),
});
