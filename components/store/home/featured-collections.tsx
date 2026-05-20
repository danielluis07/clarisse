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
    offset: "lg:mt-0",
  },
  {
    name: "Soft Tailoring",
    description:
      "Volumes leves, ombros suaves e linhas que respiram. O ofício, releído.",
    href: "/colecoes/soft-tailoring",
    image:
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1800&auto=format&fit=crop",
    eyebrow: "Edit nº 02",
    offset: "lg:mt-32",
  },
  {
    name: "Minimal Dresses",
    description:
      "Cortes precisos e tons neutros para os dias em que menos é, simplesmente, mais.",
    href: "/colecoes/minimal-dresses",
    image:
      "https://images.unsplash.com/photo-1496661269814-a841e78df103?q=80&w=1800&auto=format&fit=crop",
    eyebrow: "Edit nº 03",
    offset: "lg:mt-32",
  },
  {
    name: "Evening Edit",
    description:
      "A noite, em silêncio. Tecidos fluidos para uma presença sem ostentação.",
    href: "/colecoes/evening-edit",
    image:
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1800&auto=format&fit=crop",
    eyebrow: "Edit nº 04",
    offset: "lg:mt-0",
  },
];

export const FeaturedCollections = () => {
  return (
    <section className="overflow-hidden bg-background py-24 md:py-32">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/55">
            Editoriais selecionados
          </p>
          <h2 className="mt-4 font-heading text-4xl font-light leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            As coleções da estação
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-foreground/70 md:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quatro
            edições curadas para construir um guarda-roupa coerente e
            duradouro.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-y-16 md:gap-x-8 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-20">
          {collections.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`group block ${c.offset}`}
            >
              <div className="relative aspect-4/5 w-full overflow-hidden bg-foreground/3 md:aspect-5/6">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-1200 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/60 via-black/15 to-transparent" />
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

        <div className="mt-20 flex justify-center lg:mt-32">
          <Link
            href="/colecoes"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-foreground"
          >
            <span className="border-b border-foreground/40 pb-1 transition-colors hover:border-foreground">
              Ver todas as coleções
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
