import "server-only";

import { prefetch, trpc } from "@/trpc/server";
import type { CustomersInput } from "@/modules/customers/types";
import { normalizeCustomersParams } from "@/modules/customers/utils";

export const prefetchCustomers = async (params: Partial<CustomersInput>) => {
  return prefetch(
    trpc.customers.list.queryOptions(normalizeCustomersParams(params)),
  );
};
