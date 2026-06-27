import type { LucideIcon } from "lucide-react";
import type { OrderStatus } from "@/modules/checkout/types";
import type { AppRouter, RouterOutput } from "@/trpc/routers/_app";
import type { inferRouterInputs } from "@trpc/server";

type RouterInput = inferRouterInputs<AppRouter>;

export type AccountTab = "overview" | "orders" | "profile" | "addresses";

/**
 * Minimal user shape the account UI needs. Derived from the Better Auth
 * session on the server and passed down to the (client) account view.
 */
export type AccountUser = {
  name: string;
  email: string;
  image?: string | null;
  createdAt: Date | string;
};

export type AccountNavItem = {
  id: AccountTab;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type AccountOrderItem = {
  id: string;
  name: string;
  variant: string;
  quantity: number;
};

export type AccountOrder = {
  id: string;
  number: string;
  /** ISO date string. */
  placedAt: string;
  status: OrderStatus;
  items: AccountOrderItem[];
  totalCents: number;
};

/** A single delivery address as returned by the account router. */
export type AccountAddress = RouterOutput["account"]["listAddresses"][number];

export type CreateAddressInput = RouterInput["account"]["createAddress"];
export type UpdateAddressInput = RouterInput["account"]["updateAddress"];
