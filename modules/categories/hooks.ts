import "client-only";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { normalizeCategoriesParams } from "@/modules/categories/params";
import type {
  CategoriesInput,
  CategoryInput,
} from "@/modules/categories/types";

export const useCategoriesSuspense = (params: Partial<CategoriesInput>) => {
  const trpc = useTRPC();
  const normalized = normalizeCategoriesParams(params);

  return useSuspenseQuery(trpc.categories.list.queryOptions(normalized));
};

export const useCategorySuspense = (params: CategoryInput) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.categories.get.queryOptions(params));
};

export const useCreateCategory = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.categories.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.categories.list.queryKey(),
        });
      },
    }),
  );
};

export const useUpdateCategory = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.categories.update.mutationOptions({
      onSuccess: (category) => {
        queryClient.invalidateQueries({
          queryKey: trpc.categories.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.categories.get.queryKey({ id: category.id }),
        });
      },
    }),
  );
};

export const useDeleteCategory = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.categories.delete.mutationOptions({
      onSuccess: (category) => {
        queryClient.invalidateQueries({
          queryKey: trpc.categories.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.categories.get.queryKey({ id: category.id }),
        });
      },
    }),
  );
};

export const useDeleteCategories = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.categories.deleteMany.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.categories.list.queryKey(),
        });
      },
    }),
  );
};
