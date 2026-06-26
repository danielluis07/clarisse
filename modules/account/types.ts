import type { LucideIcon } from "lucide-react";
import type { OrderStatus } from "@/modules/checkout/types";

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

export type AccountAddress = {
  id: string;
  label: string;
  recipient: string;
  line1: string;
  line2?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  phone?: string | null;
  isDefault: boolean;
};
