"use client";

import { Check, Truck } from "lucide-react";

import { cn, centsToReais } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { ShippingQuoteOption } from "@/modules/shipping/types";

const formatDeliveryTime = (option: ShippingQuoteOption) => {
  if (
    option.deliveryRange &&
    option.deliveryRange.min !== option.deliveryRange.max
  ) {
    return `${option.deliveryRange.min}–${option.deliveryRange.max} dias úteis`;
  }
  const days = option.deliveryTimeDays;
  return `${days} ${days === 1 ? "dia útil" : "dias úteis"}`;
};

const OptionRow = ({
  option,
  selected,
  isFree,
  onSelect,
}: {
  option: ShippingQuoteOption;
  selected: boolean;
  isFree: boolean;
  onSelect: () => void;
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
      "flex cursor-pointer items-center justify-between gap-4 border bg-background p-4 transition-colors",
      selected
        ? "border-foreground ring-1 ring-foreground"
        : "border-foreground/15 hover:border-foreground/40",
    )}>
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-foreground bg-foreground text-background"
            : "border-foreground/30 text-transparent",
        )}>
        <Check className="size-3" />
      </span>
      <div>
        <p className="text-sm text-foreground">
          {option.companyName} · {option.name}
        </p>
        <p className="mt-0.5 text-[12px] text-foreground/55">
          {formatDeliveryTime(option)}
        </p>
      </div>
    </div>
    <span className="tabular-nums text-sm">
      {isFree ? (
        <span className="uppercase tracking-[0.16em] text-foreground/70">
          Grátis
        </span>
      ) : (
        centsToReais(option.priceCents)
      )}
    </span>
  </div>
);

export const CheckoutShippingSelect = ({
  enabled,
  isLoading,
  errorMessage,
  options,
  isFree,
  selectedServiceId,
  onSelect,
}: {
  enabled: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  options: ShippingQuoteOption[];
  isFree: boolean;
  selectedServiceId: number | null;
  onSelect: (option: ShippingQuoteOption) => void;
}) => {
  return (
    <section>
      <div className="mb-6 flex items-baseline gap-4 border-b border-foreground/10 pb-4">
        <span className="font-heading text-sm tabular-nums text-foreground/35">
          03
        </span>
        <div>
          <h2 className="font-heading text-xl font-light leading-tight">
            Frete
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-foreground/55">
            Escolha a transportadora para a entrega das suas peças.
          </p>
        </div>
      </div>

      {!enabled ? (
        <div className="flex items-center gap-3 border border-dashed border-foreground/15 px-5 py-6 text-sm text-foreground/55">
          <Truck className="size-4 shrink-0 text-foreground/40" />
          Selecione um endereço de entrega para calcular o frete.
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : errorMessage ? (
        <div className="border border-dashed border-foreground/15 px-5 py-6 text-sm leading-relaxed text-foreground/60">
          {errorMessage}
        </div>
      ) : options.length === 0 ? (
        <div className="border border-dashed border-foreground/15 px-5 py-6 text-sm leading-relaxed text-foreground/60">
          Nenhuma opção de frete disponível para este endereço.
        </div>
      ) : (
        <div className="space-y-3">
          {isFree && (
            <p className="text-[12px] uppercase tracking-[0.16em] text-foreground/55">
              Frete grátis aplicado — escolha a transportadora.
            </p>
          )}
          {options.map((option) => (
            <OptionRow
              key={option.serviceId}
              option={option}
              selected={option.serviceId === selectedServiceId}
              isFree={isFree}
              onSelect={() => onSelect(option)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
