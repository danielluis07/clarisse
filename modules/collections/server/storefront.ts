import "server-only";

import { cacheByInput } from "@/lib/request-cache";
import type { StoreCollectionsInput } from "@/modules/collections/types";
import { caller } from "@/trpc/server";

const fetchStoreCollections = cacheByInput((input: StoreCollectionsInput) =>
  caller.collections.listStoreCollections(input),
);

const fetchStoreCollection = cacheByInput((input: { slug: string }) =>
  caller.collections.getStoreCollection(input),
);

export const getStoreCollections = async (input: StoreCollectionsInput = {}) =>
  fetchStoreCollections(input);

export const getStoreCollectionBySlug = async (slug: string) =>
  fetchStoreCollection({ slug });
