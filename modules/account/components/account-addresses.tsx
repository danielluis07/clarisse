"use client";

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { AccountSectionHeading } from "@/modules/account/components/account-section-heading";
import { AccountEmpty } from "@/modules/account/components/account-empty";
import { AddressCard } from "@/modules/account/components/address-card";
import { AddressFormDialog } from "@/modules/account/components/address-form-dialog";
import { useGetAddresses, useDeleteAddress } from "@/modules/account/hooks";
import type { AccountAddress } from "@/modules/account/types";

export const AccountAddresses = () => {
  const { data: addresses, isLoading, isError, refetch } = useGetAddresses();
  const deleteAddress = useDeleteAddress();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AccountAddress | null>(
    null,
  );
  const [deletingAddress, setDeletingAddress] = useState<AccountAddress | null>(
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

  const confirmDelete = async () => {
    if (!deletingAddress) return;

    try {
      await deleteAddress.mutateAsync({ id: deletingAddress.id });
      toast.success("Endereço removido.");
      setDeletingAddress(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível remover o endereço.",
      );
    }
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

  const hasAddresses = (addresses?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      <AccountSectionHeading
        eyebrow="Entrega"
        title="Endereços"
        description="Salve os locais onde você costuma receber as suas peças."
        action={hasAddresses ? addButton : undefined}
      />

      {isLoading ? (
        <div className="flex items-center justify-center border border-dashed border-foreground/15 px-6 py-20 text-foreground/50">
          <Spinner className="size-5" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-foreground/15 px-6 py-20 text-center">
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
        <AccountEmpty
          icon={MapPin}
          title="Você ainda não tem endereços."
          description="Adicione um endereço para agilizar a finalização das suas próximas compras."
          action={addButton}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {addresses?.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={openEdit}
              onDelete={setDeletingAddress}
            />
          ))}
        </div>
      )}

      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editingAddress}
      />

      <Dialog
        open={Boolean(deletingAddress)}
        onOpenChange={(open) => {
          if (!open && !deleteAddress.isPending) setDeletingAddress(null);
        }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remover endereço</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja remover
              {deletingAddress?.label
                ? ` "${deletingAddress.label}"`
                : " este endereço"}
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleteAddress.isPending}
              onClick={() => setDeletingAddress(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteAddress.isPending}
              onClick={confirmDelete}>
              {deleteAddress.isPending && <Spinner />}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
