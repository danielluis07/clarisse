import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export const CheckoutEmpty = () => {
  return (
    <section className="bg-background">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center px-6 py-28 text-center md:px-10 md:py-36">
        <div className="flex size-12 items-center justify-center border border-foreground/15 text-foreground/55">
          <ShoppingBag className="size-5" />
        </div>
        <p className="mt-8 text-[11px] uppercase tracking-[0.4em] text-foreground/50">
          Checkout
        </p>
        <h1 className="mt-5 font-heading text-4xl font-light leading-[1.05] tracking-tight md:text-5xl">
          Sua sacola está vazia.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-foreground/60">
          Adicione peças à sacola para seguir com a finalização da compra.
          Explore o edit Clarisse e monte o seu próximo look.
        </p>
        <Link
          href="/products"
          className="mt-10 inline-flex h-12 items-center justify-center bg-foreground px-8 text-[11px] uppercase tracking-[0.24em] text-background transition-opacity hover:opacity-90">
          Explorar o catálogo
        </Link>
      </div>
    </section>
  );
};
