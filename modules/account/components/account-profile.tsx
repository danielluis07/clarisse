"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AccountSectionHeading } from "@/modules/account/components/account-section-heading";
import type { AccountUser } from "@/modules/account/types";

export const AccountProfile = ({ user }: { user: AccountUser }) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  const isDirty = name !== user.name || phone !== "" || cpf !== "";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Design only — backend wiring comes later.
    toast("Edição de dados em breve.");
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
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            placeholder="Seu nome"
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
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            type="tel"
            autoComplete="tel"
            placeholder="(11) 90000-0000"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="account-document">CPF</FieldLabel>
          <Input
            id="account-document"
            value={cpf}
            onChange={(event) => setCpf(event.target.value)}
            inputMode="numeric"
            placeholder="000.000.000-00"
          />
        </Field>
      </div>

      <div className="flex justify-end border-t border-foreground/10 pt-6">
        <button
          type="submit"
          disabled={!isDirty}
          className="inline-flex h-12 items-center justify-center bg-foreground px-8 text-[11px] uppercase tracking-[0.24em] text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
          Salvar alterações
        </button>
      </div>
    </form>
  );
};
