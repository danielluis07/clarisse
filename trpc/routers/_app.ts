import { createTRPCRouter } from "@/trpc/init";
import type { inferRouterOutputs } from "@trpc/server";
import { accountRouter } from "@/modules/account/server/router";
import { bannersRouter } from "@/modules/banners/server/router";
import { categoriesRouter } from "@/modules/categories/server/router";
import { checkoutRouter } from "@/modules/checkout/server/router";
import { collectionsRouter } from "@/modules/collections/server/router";
import { customersRouter } from "@/modules/customers/server/router";
import { mediaRouter } from "@/modules/media/server/router";
import { productsRouter } from "@/modules/products/server/router";

export const appRouter = createTRPCRouter({
  banners: bannersRouter,
  customers: customersRouter,
  categories: categoriesRouter,
  checkout: checkoutRouter,
  collections: collectionsRouter,
  account: accountRouter,
  media: mediaRouter,
  products: productsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutput = inferRouterOutputs<AppRouter>;
