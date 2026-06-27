import "client-only";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Addresses live behind a client-toggled account tab the user may never open,
 * so a plain (non-suspense) query that fires when the tab mounts is a better
 * fit than server prefetch + hydration here.
 */
export const useGetAddresses = () => {
  const trpc = useTRPC();

  return useQuery(trpc.account.listAddresses.queryOptions());
};

export const useGetProfile = () => {
  const trpc = useTRPC();

  return useQuery(trpc.account.getProfile.queryOptions());
};

export const useUpdateProfile = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.account.updateProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.account.getProfile.queryKey(),
        });
      },
    }),
  );
};

export const useCreateAddress = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.account.createAddress.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.account.listAddresses.queryKey(),
        });
      },
    }),
  );
};

export const useUpdateAddress = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.account.updateAddress.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.account.listAddresses.queryKey(),
        });
      },
    }),
  );
};

export const useDeleteAddress = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.account.deleteAddress.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.account.listAddresses.queryKey(),
        });
      },
    }),
  );
};
