"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import {
  getCartItemCount,
  getCartSubtotalCents,
  useCartStore,
} from "@/hooks/cart";
import { centsToReais } from "@/lib/utils";
import type { CartItem } from "@/types/cart";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/modules/checkout/constants";
import { toast } from "sonner";

export const CartSheetSummary = ({ items }: { items: CartItem[] }) => {
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();
  const subtotalCents = getCartSubtotalCents(items);
  const itemCount = getCartItemCount(items);
  const { useSession } = authClient;
  const { data: session } = useSession();
  const freeShippingRemaining = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents,
  );
  const progress = Math.min(
    100,
    Math.round((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100),
  );

  return (
    <SheetFooter className="border-t border-foreground/10 px-6 py-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-foreground/60">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "itens"})
          </span>
          <span className="font-medium tabular-nums">
            {centsToReais(subtotalCents)}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-1 bg-foreground/10">
            <div
              className="h-full bg-foreground transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] leading-relaxed text-foreground/55">
            {freeShippingRemaining === 0
              ? "Frete grátis aplicado para este pedido."
              : `Faltam ${centsToReais(freeShippingRemaining)} para frete grátis.`}
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <SheetClose asChild>
          <Button
            onClick={() => {
              if (!session) {
                toast.info(
                  "Você precisa estar logado para finalizar a compra.",
                );
                router.push("/login?next=/checkout");
                return;
              }
              router.push("/checkout");
            }}
            className="flex h-12 items-center justify-center bg-foreground px-6 text-[11px] uppercase tracking-[0.24em] text-background transition-opacity hover:opacity-90">
            Finalizar compra
          </Button>
        </SheetClose>

        <div className="grid grid-cols-2 gap-3">
          <SheetClose asChild>
            <button
              type="button"
              className="flex h-10 items-center justify-center border border-foreground/15 px-4 text-[10px] uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground">
              Continuar
            </button>
          </SheetClose>
          <button
            type="button"
            onClick={clearCart}
            className="flex h-10 items-center justify-center border border-foreground/15 px-4 text-[10px] uppercase tracking-[0.2em] text-foreground/65 transition-colors hover:border-foreground hover:text-foreground">
            Limpar
          </button>
        </div>
      </div>
    </SheetFooter>
  );
};
