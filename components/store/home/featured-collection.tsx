import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const highlights = [
  "Lã merino italiana",
  "Caimento estruturado",
  "Edição limitada",
];

export const FeaturedCollection = () => {
  return (
    <section className="border-y border-foreground/10 bg-background">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 lg:grid-cols-12">
        <div className="relative aspect-4/5 w-full bg-neutral-900 lg:col-span-7 lg:aspect-auto lg:min-h-180">
          <Image
            src="https://images.unsplash.com/photo-1702579450298-64d0c9f75a2d"
            alt="Editorial da coleção Soft Tailoring"
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/40 to-transparent"
          />
        </div>

        <div className="relative flex items-center bg-secondary lg:col-span-5">
          {/* Oversized faint index for editorial depth. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-6 top-8 font-heading text-[110px] font-light leading-none text-foreground/5 md:text-[150px]">
            02
          </span>

          <div className="relative px-6 py-16 md:px-14 md:py-24 lg:px-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
              Coleção em destaque
            </p>
            <h2 className="mt-5 font-heading text-4xl font-light leading-[1.05] tracking-tight md:text-6xl">
              Coleção Inverno 2026
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-foreground/65 md:text-base">
              Descubra a elegância atemporal da nossa Coleção Inverno 2026, onde
              a sofisticação encontra o conforto em peças cuidadosamente
              elaboradas para elevar seu estilo nesta temporada. De casacos
              luxuosos a suéteres aconchegantes, cada item é uma expressão de
              qualidade e design refinado, perfeito para enfrentar o frio com
              elegância. Explore a coleção e encontre suas novas peças favoritas
              para o inverno.
            </p>

            <ul className="mt-10 space-y-4">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-4 border-b border-foreground/10 pb-4 text-sm text-foreground/75">
                  <span className="h-px w-6 shrink-0 bg-foreground/30" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/colecoes/soft-tailoring"
              className="group mt-12 inline-flex items-center gap-3 bg-foreground px-9 py-4 text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90">
              Descobrir a coleção
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
