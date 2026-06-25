import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutReturnCartEffect } from "@/components/store/checkout/checkout-return-cart-effect";
import { mpPayment } from "@/lib/mercadopago";
import {
  copyByStatus,
  getPaymentOrderId,
  getReturnStatusFromPayment,
} from "@/modules/checkout/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Status do pedido | Clarisse",
  description: "Acompanhe o retorno de pagamento do seu pedido Clarisse.",
  robots: { index: false, follow: false },
};

const CheckoutReturnPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    order_id?: string;
    payment_id?: string;
  }>;
}) => {
  const params = await searchParams;
  const payment = params.payment_id
    ? await mpPayment.get({ id: params.payment_id })
    : null;
  const status = getReturnStatusFromPayment(payment);
  const copy = copyByStatus[status];
  const Icon = copy.icon;
  const iconColor = copy.iconColor;
  const shouldClearCart = status !== "failure";
  const orderId =
    (payment ? getPaymentOrderId(payment) : null) ?? params.order_id ?? null;

  return (
    <section className="bg-background">
      <CheckoutReturnCartEffect shouldClear={shouldClearCart} />
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-20 text-center md:px-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-foreground/15">
          <Icon className={cn("size-6", iconColor)} />
        </div>
        <p className="mt-8 text-[10px] uppercase tracking-[0.28em] text-foreground/45">
          Mercado Pago
        </p>
        <h1 className="mt-4 font-heading text-4xl font-light leading-tight md:text-6xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-foreground/60">
          {copy.description}
        </p>
        {orderId && (
          <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-foreground/45">
            Pedido {orderId}
          </p>
        )}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="flex h-11 items-center justify-center bg-foreground px-6 text-[11px] uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-90">
            Continuar comprando
          </Link>
          {status === "failure" && (
            <Link
              href="/checkout"
              className="flex h-11 items-center justify-center border border-foreground/15 px-6 text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:border-foreground">
              Voltar ao checkout
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default CheckoutReturnPage;
