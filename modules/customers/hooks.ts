import "client-only";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { normalizeCustomersParams } from "@/modules/customers/params";
import type { CustomerInput, CustomersInput } from "@/modules/customers/types";

export const useCustomersSuspense = (params: Partial<CustomersInput>) => {
  const trpc = useTRPC();
  const normalized = normalizeCustomersParams(params);

  return useSuspenseQuery(trpc.customers.list.queryOptions(normalized));
};

export const useCustomerSuspense = (params: CustomerInput) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.customers.get.queryOptions(params));
};
