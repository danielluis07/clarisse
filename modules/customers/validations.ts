import { z } from "zod";
import { PAGINATION } from "@/constants";
import { isoDate } from "@/lib/validations";

export const customerSortBySchema = z.enum(["createdAt", "updatedAt", "name"]);
export const customerSortOrderSchema = z.enum(["asc", "desc"]);

export const listCustomersInput = z
  .object({
    page: z.number().min(1).default(1),
    perPage: z.number().min(1).max(100).default(PAGINATION.DEFAULT_PER_PAGE),
    search: z.string().optional(),
    sortBy: customerSortBySchema.default("createdAt"),
    sortOrder: customerSortOrderSchema.default("desc"),
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
