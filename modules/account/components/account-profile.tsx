"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AccountSectionHeading } from "@/modules/account/components/account-section-heading";
import { useGetProfile, useUpdateProfile } from "@/modules/account/hooks";
import { formatPhoneInput } from "@/lib/utils";
import type { AccountUser } from "@/modules/account/types";

export const AccountProfile = ({ user }: { user: AccountUser }) => {
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();

  // Phone is stored as raw digits; only the display value is formatted.
  const savedPhone = profile?.phone ?? "";
  const [phone, setPhone] = useState(savedPhone);

  // Hydrate the field when the customer profile loads (or its phone changes),
  // resetting any unsaved edits — adjusting state during render avoids the
  // cascading re-render an effect would cause here.
  const [hydratedPhone, setHydratedPhone] = useState(savedPhone);
  if (savedPhone !== hydratedPhone) {
    setHydratedPhone(savedPhone);
    setPhone(savedPhone);
  }

  const isDirty = phone !== savedPhone;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isDirty || updateProfile.isPending) return;

    try {
      await updateProfile.mutateAsync({ phone: phone || null });
      toast.success("Dados atualizados.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar os seus dados.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <AccountSectionHeading
        eyebrow="Perfil"
        title="Dados pessoais"
        description="Mantenha as suas informações de contato sempre atualizadas."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="account-name">Nome completo</FieldLabel>
          <Input
            id="account-name"
            value={user.name}
            autoComplete="name"
            disabled
            readOnly
          />
        </Field>

        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="account-email">E-mail</FieldLabel>
          <div className="relative">
            <Input
              id="account-email"
              value={user.email}
              type="email"
              disabled
              readOnly
              className="pr-28"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-foreground/45">
              <Check className="size-3" />
              Verificado
            </span>
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="account-phone">Telefone</FieldLabel>
          <Input
            id="account-phone"
            value={formatPhoneInput(phone)}
            onChange={(event) =>
              setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))
            }
            type="tel"
            autoComplete="tel"
            placeholder="(11) 90000-0000"
            disabled={isLoading || updateProfile.isPending}
          />
        </Field>
      </div>

      <div className="flex justify-end border-t border-foreground/10 pt-6">
        <button
          type="submit"
          disabled={!isDirty || updateProfile.isPending}
          className="inline-flex h-12 items-center justify-center gap-2 bg-foreground px-8 text-[11px] uppercase tracking-[0.24em] text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
          {updateProfile.isPending && <Spinner />}
          Salvar alterações
        </button>
      </div>
    </form>
  );
};
