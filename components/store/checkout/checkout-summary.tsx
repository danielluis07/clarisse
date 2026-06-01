"use client";

import { Loader2, Lock } from "lucide-react";
import {
  getCartItemCount,
  getCartSubtotalCents,
  useCartStore,
} from "@/hooks/cart";
import { centsToReais } from "@/lib/utils";
import type { CartItem } from "@/types/cart";
import { CheckoutLineItem } from "@/components/store/checkout/checkout-line-item";

const FREE_SHIPPING_THRESHOLD_CENTS = 80000;
const STANDARD_SHIPPING_CENTS = 2900;
const INSTALLMENTS = 6;

export const CheckoutSummary = ({
  items,
  isPlacingOrder,
}: {
  items: CartItem[];
  isPlacingOrder: boolean;
}) => {
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotalCents = getCartSubtotalCents(items);
  const itemCount = getCartItemCount(items);
  const hasFreeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const shippingCents = hasFreeShipping ? 0 : STANDARD_SHIPPING_CENTS;
  const totalCents = subtotalCents + shippingCents;
  const freeShippingRemaining = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents,
  );
  const progress = Math.min(
    100,
    Math.round((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100),
  );
  const installmentCents = Math.round(totalCents / INSTALLMENTS);

  return (
    <aside className="lg:sticky lg:top-28">
      <div className="border border-foreground/10 bg-secondary">
        <div className="flex items-baseline justify-between gap-4 border-b border-foreground/10 px-6 py-5">
          <h2 className="font-heading text-lg font-light uppercase tracking-[0.2em]">
            Resumo
          </h2>
          <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/50">
            {itemCount === 1 ? "1 item" : `${itemCount} itens`}
          </span>
        </div>

        <ul className="px-6">
          {items.map((item) => (
            <CheckoutLineItem key={item.productVariantId} item={item} />
          ))}
        </ul>

        <div className="flex flex-col gap-3 border-t border-foreground/10 px-6 py-5">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-foreground/60">Subtotal</span>
            <span className="tabular-nums">{centsToReais(subtotalCents)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-foreground/60">Frete</span>
            <span className="tabular-nums">
              {hasFreeShipping ? (
                <span className="uppercase tracking-[0.16em] text-foreground/70">
                  Grátis
                </span>
              ) : (
                centsToReais(shippingCents)
              )}
            </span>
          </div>

          <div className="mt-1 flex flex-col gap-2">
            <div className="h-1 bg-foreground/10">
              <div
                className="h-full bg-foreground transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] leading-relaxed text-foreground/55">
              {hasFreeShipping
                ? "Frete grátis aplicado a este pedido."
                : `Faltam ${centsToReais(freeShippingRemaining)} para frete grátis.`}
            </p>
          </div>
        </div>

        <div className="border-t border-foreground/10 px-6 py-5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[11px] uppercase tracking-[0.24em] text-foreground/70">
              Total
            </span>
            <span className="font-heading text-2xl tabular-nums">
              {centsToReais(totalCents)}
            </span>
          </div>
          <p className="mt-1.5 text-right text-[11px] text-foreground/50">
            Em até {INSTALLMENTS}x de {centsToReais(installmentCents)} sem juros
          </p>

          <button
            type="submit"
            disabled={isPlacingOrder}
            className="mt-6 flex h-14 w-full items-center justify-center gap-3 bg-foreground px-6 text-[11px] uppercase tracking-[0.24em] text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {isPlacingOrder ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processando
              </>
            ) : (
              <>
                <Lock className="size-3.5" />
                Finalizar pedido
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-foreground/45">
            <Lock className="size-3" />
            Pagamento criptografado e seguro
          </div>

          <button
            type="button"
            onClick={clearCart}
            disabled={isPlacingOrder}
            className="mt-4 w-full text-center text-[10px] uppercase tracking-[0.2em] text-foreground/45 transition-colors hover:text-foreground disabled:opacity-40">
            Esvaziar sacola
          </button>
        </div>
      </div>
    </aside>
  );
};
