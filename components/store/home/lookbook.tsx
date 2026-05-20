import Image from "next/image";
import Link from "next/link";

const looks = [
  {
    number: "Estudo nº 01",
    name: "Atelier",
    caption:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cores cruas, linhas longas, presença silenciosa.",
    image:
      "https://images.unsplash.com/photo-1485518882345-15568b007407?q=80&w=1400&auto=format&fit=crop",
    offset: "",
    aspect: "aspect-3/4",
  },
  {
    number: "Estudo nº 02",
    name: "Hora azul",
    caption:
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. O peso certo da seda no fim do dia.",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1400&auto=format&fit=crop",
    offset: "md:mt-24 lg:mt-32",
    aspect: "aspect-3/4",
  },
  {
    number: "Estudo nº 03",
    name: "Repouso",
    caption:
      "Ut enim ad minim veniam, quis nostrud exercitation. Volumes leves para um fim de semana sem pressa.",
    image:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?q=80&w=1400&auto=format&fit=crop",
    offset: "md:mt-10 lg:mt-16",
    aspect: "aspect-3/4",
  },
];

export const Lookbook = () => {
  return (
    <section className="overflow-hidden bg-background py-24 md:py-32">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/55">
              Lookbook nº 06
            </p>
            <h2 className="mt-4 font-heading text-4xl font-light leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
              Vista-se <span className="italic">com tempo.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-foreground/65 md:col-span-5 md:justify-self-end md:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Três
            estudos sobre presença, ritmo e a calma das peças que ficam — uma
            leitura da temporada em três tempos.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 md:grid-cols-3 md:gap-x-8 lg:gap-x-12">
          {looks.map((look, i) => (
            <figure key={look.number} className={look.offset}>
              <div
                className={`relative ${look.aspect} w-full overflow-hidden bg-foreground/3`}
              >
                <Image
                  src={look.image}
                  alt={look.name}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover transition-transform duration-1000 ease-out hover:scale-[1.03]"
                />
                <span className="absolute left-4 top-4 bg-background/85 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-foreground/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <figcaption className="mt-6 flex items-start gap-6">
                <span className="mt-2 hidden h-px w-10 shrink-0 bg-foreground/30 md:block" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
                    {look.number}
                  </p>
                  <h3 className="mt-2 font-heading text-2xl font-normal italic">
                    {look.name}
                  </h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-foreground/70">
                    {look.caption}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-foreground/10 pt-10 md:flex-row md:items-center">
          <p className="max-w-md font-heading text-xl italic leading-snug text-foreground/80 md:text-2xl">
            “Lorem ipsum dolor sit amet, consectetur adipiscing elit.”
          </p>
          <Link
            href="/lookbook"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-foreground"
          >
            <span className="border-b border-foreground/40 pb-1 transition-colors hover:border-foreground">
              Ver lookbook completo
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
