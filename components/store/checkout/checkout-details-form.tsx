import type { ComponentProps, ReactNode } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldProps = ComponentProps<"input"> & {
  label: string;
  id: string;
  className?: string;
};

const Field = ({ label, id, className, ...props }: FieldProps) => (
  <div className={cn("flex flex-col gap-2", className)}>
    <label
      htmlFor={id}
      className="text-[10px] uppercase tracking-[0.28em] text-foreground/55">
      {label}
    </label>
    <input
      id={id}
      className="h-12 border border-foreground/15 bg-transparent px-4 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/35 focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  </div>
);

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

export const CheckoutDetailsForm = () => {
  return (
    <div className="space-y-14">
      <Step
        step="01"
        title="Contato"
        hint="Enviaremos a confirmação e o rastreio para este e-mail.">
        <Field
          label="E-mail"
          id="checkout-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="voce@exemplo.com"
        />
      </Step>

      <Step
        step="02"
        title="Entrega"
        hint="Endereço onde você deseja receber as suas peças.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <Field
            label="Nome completo"
            id="checkout-name"
            name="name"
            autoComplete="name"
            required
            placeholder="Como no documento"
            className="sm:col-span-6"
          />
          <Field
            label="CEP"
            id="checkout-postal-code"
            name="postalCode"
            autoComplete="postal-code"
            inputMode="numeric"
            required
            placeholder="00000-000"
            className="sm:col-span-2"
          />
          <Field
            label="Telefone"
            id="checkout-phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            required
            placeholder="(11) 90000-0000"
            className="sm:col-span-4"
          />
          <Field
            label="Endereço"
            id="checkout-address"
            name="address"
            autoComplete="address-line1"
            required
            placeholder="Rua, avenida..."
            className="sm:col-span-4"
          />
          <Field
            label="Número"
            id="checkout-number"
            name="number"
            inputMode="numeric"
            required
            placeholder="123"
            className="sm:col-span-2"
          />
          <Field
            label="Complemento"
            id="checkout-complement"
            name="complement"
            autoComplete="address-line2"
            placeholder="Apto, bloco (opcional)"
            className="sm:col-span-3"
          />
          <Field
            label="Bairro"
            id="checkout-neighborhood"
            name="neighborhood"
            required
            placeholder="Bairro"
            className="sm:col-span-3"
          />
          <Field
            label="Cidade"
            id="checkout-city"
            name="city"
            autoComplete="address-level2"
            required
            placeholder="Cidade"
            className="sm:col-span-4"
          />
          <Field
            label="Estado"
            id="checkout-state"
            name="state"
            autoComplete="address-level1"
            required
            placeholder="UF"
            maxLength={2}
            className="sm:col-span-2"
          />
        </div>
      </Step>

      <Step
        step="03"
        title="Pagamento"
        hint="A finalização de pagamento ainda está em desenvolvimento.">
        <div className="flex items-start gap-3 border border-dashed border-foreground/25 bg-foreground/[0.02] px-5 py-4 text-sm leading-relaxed text-foreground/65">
          <Lock className="mt-0.5 size-4 shrink-0 text-foreground/45" />
          <p>
            Este checkout está em modo demonstração. Nenhum dado de cartão é
            processado e nenhuma cobrança será feita ao finalizar o pedido.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none mt-5 grid grid-cols-1 gap-4 opacity-50 select-none sm:grid-cols-2">
          <Field
            label="Número do cartão"
            id="checkout-card-number"
            disabled
            tabIndex={-1}
            placeholder="0000 0000 0000 0000"
            className="sm:col-span-2"
          />
          <Field
            label="Validade"
            id="checkout-card-expiry"
            disabled
            tabIndex={-1}
            placeholder="MM/AA"
          />
          <Field
            label="CVV"
            id="checkout-card-cvv"
            disabled
            tabIndex={-1}
            placeholder="123"
          />
        </div>
      </Step>
    </div>
  );
};
