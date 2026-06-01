import "server-only";

import type { StoreCollectionsInput } from "@/modules/collections/types";
import { getQueryClient, trpc } from "@/trpc/server";

export const getStoreCollections = async (
  input: StoreCollectionsInput = {},
) => {
  return getQueryClient().fetchQuery(
    trpc.collections.listStoreCollections.queryOptions(input),
  );
};

export const getStoreCollectionBySlug = async (slug: string) => {
  return getQueryClient().fetchQuery(
    trpc.collections.getStoreCollection.queryOptions({ slug }),
  );
};
