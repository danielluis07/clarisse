import { createTRPCRouter } from "@/trpc/init";
import type { inferRouterOutputs } from "@trpc/server";
import { bannersRouter } from "@/trpc/routers/banners";
import { customersRouter } from "@/trpc/routers/customers";
import { categoriesRouter } from "@/trpc/routers/categories";
import { collectionsRouter } from "@/trpc/routers/collections";
import { mediaRouter } from "@/trpc/routers/media";
import { productsRouter } from "@/trpc/routers/products";
import { checkoutRouter } from "@/trpc/routers/checkout";
import { accountRouter } from "@/trpc/routers/account";
import { shippingRouter } from "@/trpc/routers/shipping";

export const appRouter = createTRPCRouter({
  banners: bannersRouter,
  customers: customersRouter,
  categories: categoriesRouter,
  checkout: checkoutRouter,
  collections: collectionsRouter,
  account: accountRouter,
  media: mediaRouter,
  products: productsRouter,
  shipping: shippingRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutput = inferRouterOutputs<AppRouter>;
