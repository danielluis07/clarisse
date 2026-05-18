import Image from "next/image";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative">
      <div className="relative h-[82vh] min-h-145 w-full overflow-hidden md:h-[88vh] lg:min-h-175">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2400&auto=format&fit=crop"
          alt="Editorial Clarisse — coleção outono inverno 2026"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/15 via-transparent to-black/45" />

        <div className="absolute left-6 top-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/85 md:left-10 md:top-10">
          <span className="h-px w-10 bg-white/70" />
          <span>Outono · Inverno 2026</span>
        </div>

        <div className="absolute bottom-12 left-6 right-6 md:bottom-20 md:left-10 md:right-auto md:max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/85">
            Nova coleção
          </p>
          <h1 className="mt-5 font-heading text-[44px] font-light leading-[0.98] tracking-tight text-white md:text-7xl lg:text-[92px]">
            O essencial,
            <br />
            <span className="italic">reimaginado.</span>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-relaxed text-white/85 md:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Uma seleção
            de peças atemporais para construir um guarda-roupa que dura para
            além das estações.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/colecoes/outono-inverno-2026"
              className="inline-flex items-center justify-center bg-white px-9 py-3.5 text-[11px] uppercase tracking-[0.22em] text-foreground transition-opacity hover:opacity-90">
              Ver coleção
            </Link>
            <Link
              href="/novidades"
              className="inline-flex items-center justify-center border border-white/60 px-9 py-3.5 text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/10">
              Explorar novidades
            </Link>
          </div>
        </div>

        <div className="absolute bottom-12 right-10 hidden items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-white/70 md:bottom-20 md:flex">
          <span className="h-px w-12 bg-white/40" />
          <span className="tabular-nums">01 / 04</span>
        </div>
      </div>
    </section>
  );
};
