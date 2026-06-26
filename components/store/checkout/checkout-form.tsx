"use client";

import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { z } from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { checkoutCustomerInput } from "@/modules/checkout/validations";

type CheckoutFormInput = z.input<typeof checkoutCustomerInput>;
type CheckoutFormOutput = z.output<typeof checkoutCustomerInput>;

const defaultValues: CheckoutFormInput = {
  email: "",
  name: "",
  phone: "",
  postalCode: "",
  state: "",
  city: "",
  neighborhood: "",
  addressLine1: "",
  addressLine2: "",
  number: "",
};

const Step = ({
  step,
  title,
  hint,
  children,
}: {
  step: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) => (
  <section>
    <div className="mb-6 flex items-baseline gap-4 border-b border-foreground/10 pb-4">
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
    {children}
  </section>
);

export const CheckoutForm = ({
  formId = "checkout-form",
  isSubmitting = false,
  onSubmit,
}: {
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (values: CheckoutFormOutput) => void | Promise<void>;
}) => {
  const { control, handleSubmit } = useForm<
    CheckoutFormInput,
    unknown,
    CheckoutFormOutput
  >({
    resolver: zodResolver(checkoutCustomerInput),
    defaultValues,
  });

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-14">
      <FieldGroup>
        <Step
          step="01"
          title="Contato"
          hint="Enviaremos a confirmação e o rastreio para este e-mail.">
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="checkout-email">E-mail</FieldLabel>
                <Input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                  {...field}
                />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />
        </Step>

        <Step
          step="02"
          title="Entrega"
          hint="Endereço onde você deseja receber as suas peças.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="sm:col-span-6">
                  <FieldLabel htmlFor="checkout-name">Nome completo</FieldLabel>
                  <Input
                    id="checkout-name"
                    autoComplete="name"
                    placeholder="Como no documento"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
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
                  className="sm:col-span-2">
                  <FieldLabel htmlFor="checkout-postal-code">CEP</FieldLabel>
                  <Input
                    id="checkout-postal-code"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    placeholder="00000-000"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    {...field}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : undefined}
                  />
                </Field>
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="sm:col-span-4">
                  <FieldLabel htmlFor="checkout-phone">Telefone</FieldLabel>
                  <Input
                    id="checkout-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(11) 90000-0000"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
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
                  <FieldLabel htmlFor="checkout-address">Endereço</FieldLabel>
                  <Input
                    id="checkout-address"
                    autoComplete="address-line1"
                    placeholder="Rua, avenida..."
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
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
                  <FieldLabel htmlFor="checkout-number">Número</FieldLabel>
                  <Input
                    id="checkout-number"
                    inputMode="numeric"
                    placeholder="123"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    {...field}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : undefined}
                  />
                </Field>
              )}
            />

            <Controller
              name="addressLine2"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="sm:col-span-3">
                  <FieldLabel htmlFor="checkout-complement">
                    Complemento
                  </FieldLabel>
                  <Input
                    id="checkout-complement"
                    autoComplete="address-line2"
                    placeholder="Apto, bloco (opcional)"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
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
                  <FieldLabel htmlFor="checkout-neighborhood">
                    Bairro
                  </FieldLabel>
                  <Input
                    id="checkout-neighborhood"
                    placeholder="Bairro"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
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
                  <FieldLabel htmlFor="checkout-city">Cidade</FieldLabel>
                  <Input
                    id="checkout-city"
                    autoComplete="address-level2"
                    placeholder="Cidade"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
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
                  <FieldLabel htmlFor="checkout-state">Estado</FieldLabel>
                  <Input
                    id="checkout-state"
                    autoComplete="address-level1"
                    placeholder="UF"
                    maxLength={2}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    {...field}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : undefined}
                  />
                </Field>
              )}
            />
          </div>
        </Step>

        <Step
          step="03"
          title="Pagamento"
          hint="Você será redirecionada ao Mercado Pago para concluir com segurança.">
          <div className="flex items-start gap-3 border border-dashed border-foreground/25 bg-foreground/2 px-5 py-4 text-sm leading-relaxed text-foreground/65">
            <Lock className="mt-0.5 size-4 shrink-0 text-foreground/45" />
            <p>
              Os dados de pagamento são processados pelo Mercado Pago. A
              Clarisse salva o pedido como pendente e confirma automaticamente
              quando o pagamento for aprovado.
            </p>
          </div>
        </Step>
      </FieldGroup>
    </form>
  );
};
