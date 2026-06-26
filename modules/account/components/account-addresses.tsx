"use client";

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { AccountSectionHeading } from "@/modules/account/components/account-section-heading";
import { AccountEmpty } from "@/modules/account/components/account-empty";
import { AddressCard } from "@/modules/account/components/address-card";
import { AddressFormDialog } from "@/modules/account/components/address-form-dialog";
import { MOCK_ADDRESSES } from "@/modules/account/constants";
import type { AccountAddress } from "@/modules/account/types";

export const AccountAddresses = () => {
  const addresses = MOCK_ADDRESSES;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AccountAddress | null>(
    null,
  );

  const openCreate = () => {
    setEditingAddress(null);
    setDialogOpen(true);
  };

  const openEdit = (address: AccountAddress) => {
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const addButton = (
    <button
      type="button"
      onClick={openCreate}
      className="inline-flex h-11 items-center gap-2 border border-foreground/20 px-5 text-[11px] uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:border-foreground hover:text-foreground">
      <Plus className="size-3.5" />
      Adicionar
    </button>
  );

  return (
    <div className="space-y-8">
      <AccountSectionHeading
        eyebrow="Entrega"
        title="Endereços"
        description="Salve os locais onde você costuma receber as suas peças."
        action={addresses.length > 0 ? addButton : undefined}
      />

      {addresses.length === 0 ? (
        <AccountEmpty
          icon={MapPin}
          title="Você ainda não tem endereços."
          description="Adicione um endereço para agilizar a finalização das suas próximas compras."
          action={addButton}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editingAddress}
      />
    </div>
  );
};
