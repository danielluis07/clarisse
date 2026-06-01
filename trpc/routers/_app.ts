import { createTRPCRouter } from "@/trpc/init";
import type { inferRouterOutputs } from "@trpc/server";
import { bannersRouter } from "@/trpc/routers/banners";
import { customersRouter } from "@/trpc/routers/customers";
import { categoriesRouter } from "@/trpc/routers/categories";
import { collectionsRouter } from "@/trpc/routers/collections";
import { mediaRouter } from "@/trpc/routers/media";
import { productsRouter } from "@/trpc/routers/products";

export const appRouter = createTRPCRouter({
  banners: bannersRouter,
  customers: customersRouter,
  categories: categoriesRouter,
  collections: collectionsRouter,
  media: mediaRouter,
  products: productsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutput = inferRouterOutputs<AppRouter>;
