"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { getCartLineTotalCents, useCartStore } from "@/modules/cart/hooks";
import { centsToReais, cn } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

export const CheckoutLineItem = ({ item }: { item: CartItem }) => {
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const isAtMax =
    typeof item.maxQuantity === "number" && item.quantity >= item.maxQuantity;
  const hasComparePrice =
    typeof item.compareAtPriceCents === "number" &&
    item.compareAtPriceCents > item.unitPriceCents;
  const productHref = `/products/${item.productSlug}`;

  return (
    <li className="flex gap-4 border-b border-foreground/10 py-5 last:border-b-0">
      <Link
        href={productHref}
        className="relative aspect-3/4 w-16 shrink-0 overflow-hidden bg-foreground/5">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center font-heading text-xl text-foreground/25">
            {item.productName.charAt(0)}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={productHref}
              className="block truncate font-heading text-base font-light leading-tight transition-colors hover:text-foreground/70">
              {item.productName}
            </Link>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
              <span>{item.colorName}</span>
              <span aria-hidden="true">·</span>
              <span>{item.size}</span>
              {item.colorHex && (
                <span
                  aria-label={`Cor ${item.colorName}`}
                  className="size-3 border border-foreground/15"
                  style={{ backgroundColor: item.colorHex }}
                />
              )}
            </div>
          </div>

          <button
            type="button"
            aria-label={`Remover ${item.productName} do pedido`}
            onClick={() => removeItem(item.productVariantId)}
            className="text-foreground/45 transition-colors hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="inline-flex h-8 items-center border border-foreground/15">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              disabled={item.quantity <= 1}
              onClick={() => decrementItem(item.productVariantId)}
              className="flex size-8 items-center justify-center text-foreground/65 transition-colors hover:text-foreground disabled:opacity-30">
              <Minus className="size-3" />
            </button>
            <span className="w-7 text-center text-sm tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              disabled={isAtMax}
              onClick={() => incrementItem(item.productVariantId)}
              className="flex size-8 items-center justify-center text-foreground/65 transition-colors hover:text-foreground disabled:opacity-30">
              <Plus className="size-3" />
            </button>
          </div>

          <div className="text-right">
            <p className="text-sm tabular-nums">
              {centsToReais(getCartLineTotalCents(item))}
            </p>
            {hasComparePrice && (
              <p className="text-[11px] tabular-nums text-foreground/40 line-through">
                {centsToReais(item.compareAtPriceCents! * item.quantity)}
              </p>
            )}
            <p
              className={cn(
                "mt-0.5 text-[10px] uppercase tracking-[0.16em] text-foreground/45",
                item.quantity === 1 && "sr-only",
              )}>
              {centsToReais(item.unitPriceCents)} cada
            </p>
          </div>
        </div>
      </div>
    </li>
  );
};
