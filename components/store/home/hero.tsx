import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative isolate flex min-h-[88svh] w-full items-end overflow-hidden bg-neutral-900">
      <Image
        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2400&auto=format&fit=crop"
        alt="Modelo vestindo a nova coleção Outono Inverno da Clarisse"
        fill
        preload
        sizes="100vw"
        className="-z-10 animate-in fade-in object-cover object-center duration-1600 ease-out"
      />
      {/* Scrim for legibility — anchored bottom-left where the copy sits. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/65 via-black/15 to-black/5"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-black/35 to-transparent"
      />

      <div className="mx-auto w-full max-w-screen-2xl px-6 pb-16 pt-28 md:px-10 md:pb-24">
        <div className="max-w-2xl">
          <p className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both text-[11px] uppercase tracking-[0.42em] text-white/80 delay-150 duration-700">
            Coleção Outono · Inverno 2026
          </p>

          <h1 className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-6 font-heading text-5xl font-light leading-[0.95] tracking-tight text-white delay-200 duration-1000 md:text-7xl lg:text-[88px]">
            A elegância
            <br />
            do essencial
          </h1>

          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-7 max-w-md text-sm leading-relaxed text-white/75 delay-300 duration-1000 md:text-base">
            Alfaiataria precisa, vestidos minimalistas e básicos elevados para
            uma rotina que pede presença, conforto e intenção.
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-10 flex flex-col gap-3 delay-500 duration-1000 sm:flex-row sm:items-center sm:gap-5">
            <Link
              href="/novidades"
              className="group inline-flex items-center justify-center gap-3 bg-white px-9 py-4 text-[11px] uppercase tracking-[0.25em] text-black transition-colors hover:bg-white/90"
            >
              Ver novidades
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/colecoes"
              className="group inline-flex items-center justify-center gap-2 px-2 py-4 text-[11px] uppercase tracking-[0.25em] text-white"
            >
              <span className="border-b border-white/40 pb-1 transition-colors group-hover:border-white">
                Explorar a coleção
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Discreet editorial marker, bottom-right. */}
      <span className="absolute bottom-8 right-6 hidden items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/55 md:right-10 md:flex">
        <span className="h-px w-10 bg-white/40" />
        Editorial Nº 01
      </span>
    </section>
  );
};
