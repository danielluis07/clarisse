"use client";

import { ArrowRight, MapPin, UserRound } from "lucide-react";
import { AccountSectionHeading } from "@/modules/account/components/account-section-heading";
import { OrderCard } from "@/modules/account/components/order-card";
import { MOCK_ADDRESSES, MOCK_ORDERS } from "@/modules/account/constants";
import type { AccountTab, AccountUser } from "@/modules/account/types";

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="border border-foreground/10 bg-background px-5 py-6">
    <p className="font-heading text-3xl font-light tabular-nums leading-none">
      {value}
    </p>
    <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-foreground/50">
      {label}
    </p>
  </div>
);

const InfoPanel = ({
  icon: Icon,
  title,
  children,
  actionLabel,
  onAction,
}: {
  icon: typeof UserRound;
  title: string;
  children: React.ReactNode;
  actionLabel: string;
  onAction: () => void;
}) => (
  <div className="flex flex-col border border-foreground/10 bg-background">
    <div className="flex items-center gap-2.5 border-b border-foreground/10 px-5 py-4">
      <Icon className="size-4 text-foreground/45" />
      <span className="text-[11px] uppercase tracking-[0.2em] text-foreground/70">
        {title}
      </span>
    </div>
    <div className="flex-1 px-5 py-5 text-sm leading-relaxed text-foreground/70">
      {children}
    </div>
    <button
      type="button"
      onClick={onAction}
      className="group flex items-center justify-between gap-2 border-t border-foreground/10 px-5 py-3.5 text-[10px] uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-foreground">
      {actionLabel}
      <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  </div>
);

export const AccountOverview = ({
  user,
  onNavigate,
}: {
  user: AccountUser;
  onNavigate: (tab: AccountTab) => void;
}) => {
  const totalOrders = MOCK_ORDERS.length;
  const deliveredOrders = MOCK_ORDERS.filter(
    (order) => order.status === "delivered",
  ).length;
  const recentOrder = MOCK_ORDERS[0];
  const defaultAddress =
    MOCK_ADDRESSES.find((address) => address.isDefault) ?? MOCK_ADDRESSES[0];

  return (
    <div className="space-y-10">
      <AccountSectionHeading
        eyebrow="Resumo"
        title="Visão geral"
        description="Tudo o que você precisa saber sobre a sua conta em um só lugar."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard value={String(totalOrders)} label="Pedidos" />
        <StatCard value={String(deliveredOrders)} label="Entregues" />
        <StatCard
          value={String(MOCK_ADDRESSES.length)}
          label="Endereços salvos"
        />
      </div>

      {recentOrder && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[11px] uppercase tracking-[0.24em] text-foreground/50">
              Pedido recente
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("orders")}
              className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-foreground">
              Ver todos
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
          <OrderCard order={recentOrder} />
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <InfoPanel
          icon={UserRound}
          title="Seus dados"
          actionLabel="Editar dados"
          onAction={() => onNavigate("profile")}>
          <p className="font-heading text-base font-light text-foreground">
            {user.name}
          </p>
          <p className="mt-2">{user.email}</p>
        </InfoPanel>

        {defaultAddress && (
          <InfoPanel
            icon={MapPin}
            title="Endereço padrão"
            actionLabel="Gerenciar endereços"
            onAction={() => onNavigate("addresses")}>
            <p className="font-heading text-base font-light text-foreground">
              {defaultAddress.recipient}
            </p>
            <p className="mt-2">
              {defaultAddress.line1}
              {defaultAddress.line2 ? `, ${defaultAddress.line2}` : ""}
            </p>
            <p>
              {defaultAddress.city} — {defaultAddress.state} ·{" "}
              {defaultAddress.postalCode}
            </p>
          </InfoPanel>
        )}
      </div>
    </div>
  );
};
