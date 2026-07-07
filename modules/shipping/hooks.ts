import "client-only";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { CalculateQuoteInput } from "@/modules/shipping/validations";

/** Storefront freight quote. Disabled until there is a destination CEP + items. */
export const useShippingQuote = (
  input: CalculateQuoteInput,
  enabled: boolean,
) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.shipping.quote.queryOptions(input, { enabled, retry: false }),
  );
};

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
