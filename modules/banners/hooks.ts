import "client-only";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import type { BannerInput, BannersInput } from "@/modules/banners/types";
import { normalizeBannersParams } from "@/modules/banners/params";
import { useTRPC } from "@/trpc/client";

export const useBannersSuspense = (params: Partial<BannersInput>) => {
  const trpc = useTRPC();
  const normalized = normalizeBannersParams(params);

  return useSuspenseQuery(trpc.banners.list.queryOptions(normalized));
};

export const useBannerSuspense = (params: BannerInput) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.banners.get.queryOptions(params));
};

export const useCreateBanner = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.banners.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.banners.list.queryKey(),
        });
      },
    }),
  );
};

export const useUpdateBanner = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.banners.update.mutationOptions({
      onSuccess: (banner) => {
        queryClient.invalidateQueries({
          queryKey: trpc.banners.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.banners.get.queryKey({ id: banner.id }),
        });
      },
    }),
  );
};

export const useDeleteBanner = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.banners.delete.mutationOptions({
      onSuccess: (banner) => {
        queryClient.invalidateQueries({
          queryKey: trpc.banners.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.banners.get.queryKey({ id: banner.id }),
        });
      },
    }),
  );
};

export const useDeleteBanners = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.banners.deleteMany.mutationOptions({
      onSuccess: (banners) => {
        queryClient.invalidateQueries({
          queryKey: trpc.banners.list.queryKey(),
        });

        banners.forEach((banner) => {
          queryClient.invalidateQueries({
            queryKey: trpc.banners.get.queryKey({ id: banner.id }),
          });
        });
      },
    }),
  );
};
