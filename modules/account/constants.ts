import { LayoutGrid, MapPin, Package, UserRound } from "lucide-react";
import type { OrderStatus } from "@/modules/checkout/types";
import type { AccountNavItem, AccountOrder } from "@/modules/account/types";

export const ACCOUNT_NAV: AccountNavItem[] = [
  {
    id: "overview",
    label: "Visão geral",
    description: "Resumo da sua conta",
    icon: LayoutGrid,
  },
  {
    id: "orders",
    label: "Pedidos",
    description: "Histórico e rastreio",
    icon: Package,
  },
  {
    id: "profile",
    label: "Dados pessoais",
    description: "Nome, contato e acesso",
    icon: UserRound,
  },
  {
    id: "addresses",
    label: "Endereços",
    description: "Locais de entrega",
    icon: MapPin,
  },
];

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Aguardando pagamento",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  paid: {
    label: "Pagamento aprovado",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  processing: {
    label: "Em preparação",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  shipped: {
    label: "Enviado",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  delivered: {
    label: "Entregue",
    className: "border-emerald-200 bg-emerald-100 text-emerald-800",
  },
  canceled: {
    label: "Cancelado",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  refunded: {
    label: "Reembolsado",
    className: "border-zinc-200 bg-zinc-100 text-zinc-600",
  },
};

/**
 * Placeholder data used purely to render the account design. Replace with real
 * tRPC queries when the account feature is wired to the backend.
 */
export const MOCK_ORDERS: AccountOrder[] = [
  {
    id: "ord_1",
    number: "CL-1042",
    placedAt: "2026-06-12T14:05:00.000Z",
    status: "shipped",
    totalCents: 89800,
    items: [
      {
        id: "it_1",
        name: "Blazer Aurora",
        variant: "Preto · M",
        quantity: 1,
      },
      {
        id: "it_2",
        name: "Calça Alfaiataria Lumière",
        variant: "Areia · 38",
        quantity: 1,
      },
    ],
  },
  {
    id: "ord_2",
    number: "CL-0987",
    placedAt: "2026-05-28T18:42:00.000Z",
    status: "delivered",
    totalCents: 52900,
    items: [
      {
        id: "it_3",
        name: "Vestido Minimal Solène",
        variant: "Off-white · P",
        quantity: 1,
      },
    ],
  },
  {
    id: "ord_3",
    number: "CL-0915",
    placedAt: "2026-04-09T11:20:00.000Z",
    status: "delivered",
    totalCents: 119700,
    items: [
      {
        id: "it_4",
        name: "Bolsa Élise",
        variant: "Caramelo · Único",
        quantity: 1,
      },
      {
        id: "it_5",
        name: "Camisa Oversized Margaux",
        variant: "Branco · M",
        quantity: 2,
      },
    ],
  },
];
