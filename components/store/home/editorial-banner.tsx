import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const EditorialBanner = () => {
  return (
    <section className="relative isolate flex min-h-[78svh] w-full items-center justify-center overflow-hidden bg-foreground">
      <Image
        src="https://images.unsplash.com/photo-1635693056259-c6e95113dbee"
        alt="Campanha editorial Clarisse"
        fill
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/45" />

      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/80">
          O Editorial
        </p>
        <h2 className="mt-6 font-heading text-4xl font-light leading-[1.02] tracking-tight text-white md:text-6xl lg:text-7xl">
          Vestir-se devagar
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
          Um ensaio sobre peças que acompanham o corpo sem pressa: camadas
          leves, tons neutros e silhuetas pensadas para durar.
        </p>
        <Link
          href="/editorial"
          className="group mt-10 inline-flex items-center gap-3 border border-white/40 px-9 py-4 text-[11px] uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-black">
          Ver o editorial
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};
