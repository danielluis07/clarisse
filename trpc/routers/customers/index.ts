import { db } from "@/db";
import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { customers } from "@/db/schema";
import { eq, desc, or, ilike, and, asc, count, gte, lte } from "drizzle-orm";
import {
  getCustomerInput,
  listCustomersInput,
} from "@/modules/customers/validations";

export const customersRouter = createTRPCRouter({
  list: adminProcedure.input(listCustomersInput).query(async ({ input }) => {
    const { page, perPage, search, sortBy, sortOrder, createdAtFrom, createdAtTo } =
      input;
    const offset = (page - 1) * perPage;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(customers.name, `%${search}%`),
          ilike(customers.email, `%${search}%`),
        ),
      );
    }

    if (createdAtFrom) {
      conditions.push(gte(customers.createdAt, new Date(createdAtFrom)));
    }

    if (createdAtTo) {
      conditions.push(lte(customers.createdAt, new Date(createdAtTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderByColumn = {
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
      name: customers.name,
    }[sortBy];

    const orderBy =
      sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    const [data, total] = await Promise.all([
      db
        .select({
          id: customers.id,
          name: customers.name,
          email: customers.email,
          createdAt: customers.createdAt,
          updatedAt: customers.updatedAt,
        })
        .from(customers)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(perPage)
        .offset(offset),
      db
        .select({ count: count() })
        .from(customers)
        .where(whereClause)
        .then(([result]) => result?.count ?? 0),
    ]);

    return {
      data,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }),

  get: adminProcedure.input(getCustomerInput).query(async ({ input }) => {
    const { id } = input;

    const [data] = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        createdAt: customers.createdAt,
      })
      .from(customers)
      .where(eq(customers.id, id));

    if (!data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cliente não encontrado",
      });
    }

    return data;
  }),
});
