import type { AppRouter, RouterOutput } from "@/trpc/routers/_app";
import type { inferRouterInputs } from "@trpc/server";

type RouterInput = inferRouterInputs<AppRouter>;

export type StoreCollectionsInput =
  RouterInput["collections"]["listStoreCollections"];
export type StoreCollectionsOutput =
  RouterOutput["collections"]["listStoreCollections"];
export type StoreCollectionInput =
  RouterInput["collections"]["getStoreCollection"];
export type StoreCollectionOutput =
  RouterOutput["collections"]["getStoreCollection"];
export type StoreCollection = NonNullable<StoreCollectionOutput>;
export type StoreCollectionImage = NonNullable<StoreCollection["image"]>;
