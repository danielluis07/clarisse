"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { useCreateAddress, useUpdateAddress } from "@/modules/account/hooks";
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
  isDefault: address?.isDefault ?? false,
});

export const AddressFormDialog = ({
  open,
  onOpenChange,
  address,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: AccountAddress | null;
  /** Called with the freshly created address, e.g. to auto-select it. */
  onCreated?: (address: AccountAddress) => void;
}) => {
  const isEditing = Boolean(address);

  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const isPending = createAddress.isPending || updateAddress.isPending;

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

  const onSubmit = async (values: AccountAddressOutput) => {
    try {
      if (address) {
        await updateAddress.mutateAsync({ id: address.id, ...values });
        toast.success("Endereço atualizado.");
      } else {
        const created = await createAddress.mutateAsync(values);
        onCreated?.(created);
        toast.success("Endereço adicionado.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o endereço.",
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}>
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
              <Controller
                name="label"
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="sm:col-span-3">
                    <FieldLabel htmlFor="label">Identificação</FieldLabel>
                    <Input
                      id="label"
                      placeholder="Casa, Trabalho..."
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                name="recipient"
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="sm:col-span-3">
                    <FieldLabel htmlFor="recipient">Destinatário</FieldLabel>
                    <Input
                      id="recipient"
                      placeholder="Quem vai receber"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                name="postalCode"
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="sm:col-span-3">
                    <FieldLabel htmlFor="postalCode">CEP</FieldLabel>
                    <Input
                      id="postalCode"
                      placeholder="00000-000"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                name="addressLine1"
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="sm:col-span-4">
                    <FieldLabel htmlFor="addressLine1">Endereço</FieldLabel>
                    <Input
                      id="addressLine1"
                      placeholder="Rua, avenida..."
                      autoComplete="address-line1"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                name="number"
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="sm:col-span-2">
                    <FieldLabel htmlFor="number">Número</FieldLabel>
                    <Input
                      id="number"
                      placeholder="123"
                      inputMode="numeric"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                name="complement"
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="sm:col-span-3">
                    <FieldLabel htmlFor="complement">Complemento</FieldLabel>
                    <Input
                      id="complement"
                      placeholder="Apto, bloco (opcional)"
                      autoComplete="address-line2"
                      aria-invalid={fieldState.invalid}
                      {...field}
                      value={field.value ?? ""}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                name="neighborhood"
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="sm:col-span-3">
                    <FieldLabel htmlFor="neighborhood">Bairro</FieldLabel>
                    <Input
                      id="neighborhood"
                      placeholder="Bairro"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                name="city"
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="sm:col-span-4">
                    <FieldLabel htmlFor="city">Cidade</FieldLabel>
                    <Input
                      id="city"
                      placeholder="Cidade"
                      autoComplete="address-level2"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                name="state"
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="sm:col-span-2">
                    <FieldLabel htmlFor="state">Estado</FieldLabel>
                    <Input
                      id="state"
                      placeholder="UF"
                      maxLength={2}
                      autoComplete="address-level1"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
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
            disabled={isPending}
            onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={isPending}>
            {isPending && <Spinner />}
            {isEditing ? "Salvar alterações" : "Adicionar endereço"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
