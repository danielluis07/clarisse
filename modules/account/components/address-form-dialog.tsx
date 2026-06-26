"use client";

import { useEffect } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AccountAddress } from "@/modules/account/types";
import {
  accountAddressInput,
  type AccountAddressInput,
  type AccountAddressOutput,
} from "@/modules/account/validations";

const FORM_ID = "account-address-form";

const getDefaultValues = (
  address?: AccountAddress | null,
): AccountAddressInput => ({
  label: address?.label ?? "",
  recipient: address?.recipient ?? "",
  postalCode: address?.postalCode ?? "",
  addressLine1: address?.line1 ?? "",
  number: "",
  complement: address?.line2 ?? "",
  neighborhood: address?.neighborhood ?? "",
  city: address?.city ?? "",
  state: address?.state ?? "",
  phone: address?.phone ?? "",
  isDefault: address?.isDefault ?? false,
});

type AddressControl = Control<
  AccountAddressInput,
  unknown,
  AccountAddressOutput
>;

const AddressTextField = ({
  control,
  name,
  label,
  className,
  ...inputProps
}: {
  control: AddressControl;
  name: Exclude<keyof AccountAddressInput, "isDefault">;
  label: string;
  className?: string;
} & Omit<React.ComponentProps<typeof Input>, "name" | "id" | "value">) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid} className={className}>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <Input
          id={name}
          aria-invalid={fieldState.invalid}
          name={field.name}
          ref={field.ref}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          {...inputProps}
        />
        <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
      </Field>
    )}
  />
);

export const AddressFormDialog = ({
  open,
  onOpenChange,
  address,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: AccountAddress | null;
}) => {
  const isEditing = Boolean(address);

  const { control, handleSubmit, reset } = useForm<
    AccountAddressInput,
    unknown,
    AccountAddressOutput
  >({
    resolver: zodResolver(accountAddressInput),
    defaultValues: getDefaultValues(address),
  });

  // Sync the form with the address being edited each time the dialog opens.
  useEffect(() => {
    if (open) reset(getDefaultValues(address));
  }, [open, address, reset]);

  const onSubmit = (values: AccountAddressOutput) => {
    // Design only — backend wiring comes later.
    console.log("account address submit", values);
    toast.success(
      isEditing ? "Endereço atualizado." : "Endereço adicionado.",
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar endereço" : "Adicionar endereço"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados deste endereço de entrega."
              : "Cadastre um novo endereço para agilizar as suas próximas compras."}
          </DialogDescription>
        </DialogHeader>

        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <AddressTextField
                control={control}
                name="label"
                label="Identificação"
                placeholder="Casa, Trabalho..."
                autoComplete="off"
                className="sm:col-span-3"
              />
              <AddressTextField
                control={control}
                name="recipient"
                label="Destinatário"
                placeholder="Quem vai receber"
                autoComplete="name"
                className="sm:col-span-3"
              />
              <AddressTextField
                control={control}
                name="postalCode"
                label="CEP"
                placeholder="00000-000"
                inputMode="numeric"
                autoComplete="postal-code"
                className="sm:col-span-2"
              />
              <AddressTextField
                control={control}
                name="phone"
                label="Telefone"
                placeholder="(11) 90000-0000"
                type="tel"
                autoComplete="tel"
                className="sm:col-span-4"
              />
              <AddressTextField
                control={control}
                name="addressLine1"
                label="Endereço"
                placeholder="Rua, avenida..."
                autoComplete="address-line1"
                className="sm:col-span-4"
              />
              <AddressTextField
                control={control}
                name="number"
                label="Número"
                placeholder="123"
                inputMode="numeric"
                className="sm:col-span-2"
              />
              <AddressTextField
                control={control}
                name="complement"
                label="Complemento"
                placeholder="Apto, bloco (opcional)"
                autoComplete="address-line2"
                className="sm:col-span-3"
              />
              <AddressTextField
                control={control}
                name="neighborhood"
                label="Bairro"
                placeholder="Bairro"
                className="sm:col-span-3"
              />
              <AddressTextField
                control={control}
                name="city"
                label="Cidade"
                placeholder="Cidade"
                autoComplete="address-level2"
                className="sm:col-span-4"
              />
              <AddressTextField
                control={control}
                name="state"
                label="Estado"
                placeholder="UF"
                maxLength={2}
                autoComplete="address-level1"
                className="sm:col-span-2"
              />

              <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <Field orientation="horizontal" className="sm:col-span-6">
                    <Checkbox
                      id="isDefault"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="isDefault">
                        Definir como endereço padrão
                      </FieldLabel>
                      <FieldDescription>
                        Usaremos este endereço como padrão na finalização das
                        compras.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID}>
            {isEditing ? "Salvar alterações" : "Adicionar endereço"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
