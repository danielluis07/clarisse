"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCartItemCount, useCartStore } from "@/hooks/cart";
import { CartEmptyState } from "@/components/store/cart/cart-empty-state";
import { CartItemRow } from "@/components/store/cart/cart-item-row";
import { CartSheetSummary } from "@/components/store/cart/cart-sheet-summary";
import { ShoppingBag } from "lucide-react";

export const CartSheet = () => {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const itemCount = hasHydrated ? getCartItemCount(items) : 0;

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <button
        onClick={() => setCartOpen(true)}
        type="button"
        aria-label={
          itemCount === 1 ? "Sacola (1 item)" : `Sacola (${itemCount} itens)`
        }
        className="relative text-foreground/80 transition-colors hover:text-foreground">
        <ShoppingBag className="size-5" />
        <span className="absolute -right-2.5 -top-1 bg-primary px-1.5 py-0.5 text-[9px] tabular-nums text-primary-foreground rounded-full">
          {itemCount}
        </span>
      </button>
      <SheetContent
        side="right"
        className="gap-0 bg-background p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b border-foreground/10 px-6 py-5">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="flex flex-col gap-1">
              <SheetTitle className="text-lg font-light uppercase tracking-[0.22em]">
                Sacola
              </SheetTitle>
              <SheetDescription className="text-[11px] uppercase tracking-[0.22em] text-foreground/50">
                {itemCount === 1
                  ? "1 item selecionado"
                  : `${itemCount} itens selecionados`}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {items.length > 0 ? (
          <>
            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col">
                {items.map((item) => (
                  <CartItemRow key={item.productVariantId} item={item} />
                ))}
              </div>
            </ScrollArea>
            <CartSheetSummary items={items} />
          </>
        ) : (
          <CartEmptyState />
        )}
      </SheetContent>
    </Sheet>
  );
};
