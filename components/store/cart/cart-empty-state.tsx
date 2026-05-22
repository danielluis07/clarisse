"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";

export const CartEmptyState = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <div className="flex size-12 items-center justify-center border border-foreground/15 text-foreground/55">
        <ShoppingBag className="size-5" />
      </div>
      <h2 className="mt-6 font-heading text-2xl font-light">
        Sua sacola está vazia.
      </h2>
      <p className="mt-3 max-w-64 text-sm leading-relaxed text-foreground/60">
        Explore o edit Clarisse e salve peças para montar seu próximo look.
      </p>
      <SheetClose asChild>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center bg-foreground px-6 text-[11px] uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-90"
        >
          Continuar comprando
        </Link>
      </SheetClose>
    </div>
  );
};
