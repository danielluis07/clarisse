import type { AppRouter, RouterOutput } from "@/trpc/routers/_app";
import type { inferRouterInputs } from "@trpc/server";

type RouterInput = inferRouterInputs<AppRouter>;

export type CategoriesInput = RouterInput["categories"]["list"];
export type CategoriesOutput = RouterOutput["categories"]["list"];
export type CategoryOutput = CategoriesOutput["data"][number];
export type StoreCategoriesInput =
  RouterInput["categories"]["listStoreCategories"];
export type StoreCategoriesOutput =
  RouterOutput["categories"]["listStoreCategories"];
export type CategoryInput = RouterInput["categories"]["get"];
export type CreateCategoryInput = RouterInput["categories"]["create"];
export type UpdateCategoryInput = RouterInput["categories"]["update"];
export type DeleteCategoryInput = RouterInput["categories"]["delete"];

export type StoreCategory = StoreCategoriesOutput[number];
export type StoreCategoryImage = NonNullable<StoreCategory["image"]>;
