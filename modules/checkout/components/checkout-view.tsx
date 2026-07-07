"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/modules/cart/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutAddressSelect } from "@/modules/checkout/components/checkout-address-select";
import { CheckoutEmpty } from "@/modules/checkout/components/checkout-empty";
import { CheckoutSummary } from "@/modules/checkout/components/checkout-summary";
import { useCreateCheckout } from "@/modules/checkout/hooks";

export const CheckoutView = ({ contactEmail }: { contactEmail: string }) => {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const { mutate, isPending } = useCreateCheckout();

  // The cart lives in localStorage, so wait for rehydration before deciding
  // between the empty state and the checkout to avoid an SSR/CSR mismatch.
  if (!hasHydrated) {
    return <CheckoutSkeleton />;
  }

  if (items.length === 0) {
    return <CheckoutEmpty />;
  }

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      toast.error("Selecione um endereço de entrega.");
      return;
    }

    mutate({
      addressId: selectedAddressId,
      items: items.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      })),
    });
  };

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-screen-2xl px-6 pb-24 pt-12 md:px-10 md:pb-32 md:pt-16">
        <div className="border-b border-foreground/10 pb-8">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/55 transition-colors hover:text-foreground">
            <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            Continuar comprando
          </Link>
          <h1 className="mt-6 font-heading text-4xl font-light leading-[1.02] tracking-tight md:text-6xl">
            Finalizar compra
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/60">
            Revise as suas peças e escolha o endereço de entrega para concluir o
            pedido.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <CheckoutAddressSelect
              contactEmail={contactEmail}
              selectedAddressId={selectedAddressId}
              onSelect={setSelectedAddressId}
            />
          </div>
          <div className="lg:col-span-5">
            <CheckoutSummary
              items={items}
              isPlacingOrder={isPending}
              canPlaceOrder={Boolean(selectedAddressId)}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const CheckoutSkeleton = () => {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-screen-2xl px-6 pb-24 pt-12 md:px-10 md:pb-32 md:pt-16">
        <div className="border-b border-foreground/10 pb-8">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-6 h-12 w-72 max-w-full" />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-6 lg:col-span-7">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    </section>
  );
};
