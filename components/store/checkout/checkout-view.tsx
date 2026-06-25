"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/hooks/cart";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutDetailsForm } from "@/components/store/checkout/checkout-details-form";
import { CheckoutEmpty } from "@/components/store/checkout/checkout-empty";
import { CheckoutSummary } from "@/components/store/checkout/checkout-summary";

export const CheckoutView = () => {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // The cart lives in localStorage, so wait for rehydration before deciding
  // between the empty state and the checkout to avoid an SSR/CSR mismatch.
  if (!hasHydrated) {
    return <CheckoutSkeleton />;
  }

  if (items.length === 0) {
    return <CheckoutEmpty />;
  }

  const handlePlaceOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPlacingOrder) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsPlacingOrder(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            email: formData.get("email"),
            name: formData.get("name"),
            postalCode: formData.get("postalCode"),
            phone: formData.get("phone"),
            addressLine1: formData.get("addressLine1"),
            number: formData.get("number"),
            addressLine2: formData.get("addressLine2"),
            neighborhood: formData.get("neighborhood"),
            city: formData.get("city"),
            state: formData.get("state"),
          },
          items: items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        initPoint?: string;
        message?: string;
      } | null;

      if (!response.ok || !data?.initPoint) {
        throw new Error(
          data?.message ?? "Não foi possível iniciar o pagamento.",
        );
      }

      window.location.assign(data.initPoint);
    } catch (error) {
      setIsPlacingOrder(false);
      toast.error("Não foi possível iniciar o pagamento", {
        description:
          error instanceof DOMException && error.name === "AbortError"
            ? "A conexão demorou mais do que o esperado. Tente novamente."
            : error instanceof Error
              ? error.message
              : "Revise os dados e tente novamente.",
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
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
            Revise as suas peças e informe os dados de entrega para concluir o
            pedido.
          </p>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <CheckoutDetailsForm />
          </div>
          <div className="lg:col-span-5">
            <CheckoutSummary items={items} isPlacingOrder={isPlacingOrder} />
          </div>
        </form>
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
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    </section>
  );
};
