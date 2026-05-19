import "client-only";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import type {
  InventoryInput,
  ProductInput,
  ProductsInput,
} from "@/modules/products/types";
import {
  normalizeInventoryParams,
  normalizeProductsParams,
} from "@/modules/products/utils";
import { useTRPC } from "@/trpc/client";

export const useProductsSuspense = (params: Partial<ProductsInput>) => {
  const trpc = useTRPC();
  const normalized = normalizeProductsParams(params);

  return useSuspenseQuery(trpc.products.list.queryOptions(normalized));
};

export const useProductSuspense = (params: ProductInput) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.products.get.queryOptions(params));
};

export const useInventorySuspense = (params: Partial<InventoryInput>) => {
  const trpc = useTRPC();
  const normalized = normalizeInventoryParams(params);

  return useSuspenseQuery(trpc.products.inventoryList.queryOptions(normalized));
};

export const useCreateProduct = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.products.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.inventoryList.queryKey(),
        });
      },
    }),
  );
};

export const useUpdateProduct = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.products.update.mutationOptions({
      onSuccess: (product) => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.get.queryKey({ id: product.id }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.inventoryList.queryKey(),
        });
      },
    }),
  );
};

export const useDeleteProduct = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.products.delete.mutationOptions({
      onSuccess: (product) => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.get.queryKey({ id: product.id }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.inventoryList.queryKey(),
        });
      },
    }),
  );
};

export const useDeleteProducts = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.products.deleteMany.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.inventoryList.queryKey(),
        });
      },
    }),
  );
};

export const useCreateProductVariant = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.products.createVariant.mutationOptions({
      onSuccess: (variant) => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.get.queryKey({ id: variant.productId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.inventoryList.queryKey(),
        });
      },
    }),
  );
};

export const useUpdateProductVariant = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.products.updateVariant.mutationOptions({
      onSuccess: (variant) => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.get.queryKey({ id: variant.productId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.inventoryList.queryKey(),
        });
      },
    }),
  );
};

export const useReplaceProductVariants = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.products.replaceVariants.mutationOptions({
      onSuccess: ({ productId }) => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.get.queryKey({ id: productId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.inventoryList.queryKey(),
        });
      },
    }),
  );
};

export const useDeleteProductVariant = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.products.deleteVariant.mutationOptions({
      onSuccess: (variant) => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.get.queryKey({ id: variant.productId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.inventoryList.queryKey(),
        });
      },
    }),
  );
};

export const useAdjustInventory = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.products.adjustInventory.mutationOptions({
      onSuccess: (variant) => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.get.queryKey({ id: variant.productId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.inventoryList.queryKey(),
        });
      },
    }),
  );
};
