import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    name: "Office Essentials",
    description:
      "Alfaiataria refinada para o dia que pede sofisticação sem esforço.",
    href: "/colecoes/office-essentials",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1800&auto=format&fit=crop",
    eyebrow: "Edit nº 01",
  },
  {
    name: "Soft Tailoring",
    description:
      "Volumes leves, ombros suaves e linhas que respiram. O ofício, releído.",
    href: "/colecoes/soft-tailoring",
    image:
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1800&auto=format&fit=crop",
    eyebrow: "Edit nº 02",
  },
];

export const FeaturedCollections = () => {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/55">
            Editoriais selecionados
          </p>
          <h2 className="mt-4 font-heading text-4xl font-light leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            As coleções da estação
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-foreground/70 md:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curadoria
            cuidadosa para construir um guarda-roupa coerente e duradouro.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:gap-10 lg:grid-cols-2">
          {collections.map((c) => (
            <Link key={c.href} href={c.href} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-foreground/[0.03] md:aspect-[5/6]">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/80">
                    {c.eyebrow}
                  </p>
                  <h3 className="mt-3 font-heading text-3xl font-light text-white md:text-4xl">
                    {c.name}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
                    {c.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white">
                    <span className="border-b border-white/40 pb-1 transition-colors group-hover:border-white">
                      Descobrir
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
