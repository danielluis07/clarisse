import { createTRPCRouter } from "@/trpc/init";
import type { inferRouterOutputs } from "@trpc/server";
import { customersRouter } from "@/trpc/routers/customers";
import { categoriesRouter } from "@/trpc/routers/categories";

export const appRouter = createTRPCRouter({
  customers: customersRouter,
  categories: categoriesRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutput = inferRouterOutputs<AppRouter>;
