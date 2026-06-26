"use client";

import { useEffect, useState } from "react";
import { Check, MapPin, Pencil, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddressFormDialog } from "@/modules/account/components/address-form-dialog";
import { useGetAddresses } from "@/modules/account/hooks";
import type { AccountAddress } from "@/modules/account/types";

const Step = ({
  step,
  title,
  hint,
  action,
  children,
}: {
  step: string;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section>
    <div className="mb-6 flex items-center justify-between gap-4 border-b border-foreground/10 pb-4">
      <div className="flex items-baseline gap-4">
        <span className="font-heading text-sm tabular-nums text-foreground/35">
          {step}
        </span>
        <div>
          <h2 className="font-heading text-xl font-light leading-tight">
            {title}
          </h2>
          {hint && (
            <p className="mt-1 text-[12px] leading-relaxed text-foreground/55">
              {hint}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const AddressOption = ({
  address,
  selected,
  onSelect,
  onEdit,
}: {
  address: AccountAddress;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}) => (
  <div
    role="radio"
    aria-checked={selected}
    tabIndex={0}
    onClick={onSelect}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect();
      }
    }}
    className={cn(
      "group relative cursor-pointer border bg-background p-5 transition-colors",
      selected
        ? "border-foreground ring-1 ring-foreground"
        : "border-foreground/15 hover:border-foreground/40",
    )}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-full border transition-colors",
            selected
              ? "border-foreground bg-foreground text-background"
              : "border-foreground/30 text-transparent",
          )}>
          <Check className="size-3" />
        </span>
        <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/70">
          {address.label || "Endereço"}
        </span>
      </div>
      {address.isDefault && (
        <Badge className="text-[10px] uppercase tracking-[0.14em]">
          Padrão
        </Badge>
      )}
    </div>

    <div className="mt-4 text-sm leading-relaxed text-foreground/70">
      <p className="font-heading text-base font-light text-foreground">
        {address.recipient}
      </p>
      <p className="mt-2">
        {address.line1}
        {address.number ? `, ${address.number}` : ""}
        {address.line2 ? ` — ${address.line2}` : ""}
      </p>
      <p>
        {address.neighborhood ? `${address.neighborhood} · ` : ""}
        {address.city} — {address.state}
      </p>
      <p>CEP {address.postalCode}</p>
    </div>

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onEdit();
      }}
      className="absolute right-4 top-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-foreground/0 transition-colors group-hover:text-foreground/55 hover:text-foreground focus-visible:text-foreground/55">
      <Pencil className="size-3.5" />
    </button>
  </div>
);

export const CheckoutAddressSelect = ({
  contactEmail,
  selectedAddressId,
  onSelect,
}: {
  contactEmail: string;
  selectedAddressId: string | null;
  onSelect: (addressId: string) => void;
}) => {
  const { data: addresses, isLoading, isError, refetch } = useGetAddresses();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AccountAddress | null>(
    null,
  );

  // Keep a valid address selected: default to the customer's default (or first)
  // address, and recover if the current selection was edited away/deleted.
  useEffect(() => {
    if (!addresses || addresses.length === 0) return;

    const stillExists = addresses.some(
      (address) => address.id === selectedAddressId,
    );
    if (stillExists) return;

    const fallback =
      addresses.find((address) => address.isDefault) ?? addresses[0];
    onSelect(fallback.id);
  }, [addresses, selectedAddressId, onSelect]);

  const openCreate = () => {
    setEditingAddress(null);
    setDialogOpen(true);
  };

  const openEdit = (address: AccountAddress) => {
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const hasAddresses = (addresses?.length ?? 0) > 0;

  return (
    <div className="space-y-14">
      <Step
        step="01"
        title="Contato"
        hint="Enviaremos a confirmação e o rastreio para este e-mail.">
        <div className="flex items-center gap-3 border border-foreground/10 bg-secondary px-5 py-4 text-sm text-foreground/70">
          <MapPin className="size-4 shrink-0 text-foreground/40" />
          <span className="truncate">{contactEmail}</span>
        </div>
      </Step>

      <Step
        step="02"
        title="Entrega"
        hint="Escolha onde você deseja receber as suas peças."
        action={
          hasAddresses ? (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-10 items-center gap-2 border border-foreground/20 px-4 text-[11px] uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:border-foreground hover:text-foreground">
              <Plus className="size-3.5" />
              Novo
            </button>
          ) : undefined
        }>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-foreground/15 px-6 py-16 text-center">
            <p className="max-w-sm text-sm leading-relaxed text-foreground/60">
              Não foi possível carregar os seus endereços.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : !hasAddresses ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-foreground/20 px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center border border-foreground/15 text-foreground/55">
              <MapPin className="size-5" />
            </div>
            <h3 className="mt-6 font-heading text-lg font-light tracking-tight">
              Nenhum endereço salvo
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/60">
              Adicione um endereço de entrega para concluir o seu pedido.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-8 inline-flex h-11 items-center gap-2 bg-foreground px-6 text-[11px] uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-90">
              <Plus className="size-3.5" />
              Adicionar endereço
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {addresses?.map((address) => (
              <AddressOption
                key={address.id}
                address={address}
                selected={address.id === selectedAddressId}
                onSelect={() => onSelect(address.id)}
                onEdit={() => openEdit(address)}
              />
            ))}
          </div>
        )}
      </Step>

      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editingAddress}
        onCreated={(created) => onSelect(created.id)}
      />
    </div>
  );
};
