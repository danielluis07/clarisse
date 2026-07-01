import "client-only";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

export const useShippingSettingsSuspense = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.shipping.getSettings.queryOptions());
};

export const useUpdateShippingSettings = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.shipping.updateSettings.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.shipping.getSettings.queryKey(),
        });
      },
    }),
  );
};

export const useDisconnectMelhorEnvio = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.shipping.disconnect.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.shipping.getSettings.queryKey(),
        });
      },
    }),
  );
};
