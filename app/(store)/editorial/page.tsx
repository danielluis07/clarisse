import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EditorialCard } from "@/components/store/editorial/editorial-card";
import { Newsletter } from "@/components/store/home/newsletter";
import {
  getEditorials,
  getFeaturedEditorial,
} from "@/lib/placeholder/editorial";

export const metadata: Metadata = {
  title: "Editorial | Clarisse",
  description:
    "Ensaios, bastidores e guias de styling da Clarisse — uma revista sobre vestir-se devagar, com intenção e tecidos que duram.",
};

const EditorialPage = () => {
  const featured = getFeaturedEditorial();
  const rest = getEditorials().filter((story) => story.slug !== featured.slug);

  return (
    <>
      {/* Page header */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-screen-2xl px-6 pb-14 pt-16 md:px-10 md:pb-20 md:pt-24">
          <p className="text-[11px] uppercase tracking-[0.4em] text-foreground/50">
            O Editorial
          </p>
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <h1 className="font-heading text-5xl font-light leading-[0.95] tracking-tight md:text-7xl lg:col-span-8">
              Histórias sobre
              <br />
              vestir devagar
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-foreground/65 lg:col-span-4 lg:justify-self-end">
              Ensaios, bastidores do atelier e guias de styling. Uma revista
              sobre as peças que ficam — e sobre como cuidar delas.
            </p>
          </div>
        </div>
      </section>

      {/* Featured story */}
      <section className="border-b border-foreground/10 bg-background">
        <Link
          href={`/editorial/${featured.slug}`}
          className="group mx-auto grid max-w-screen-2xl grid-cols-1 lg:grid-cols-12">
          <div className="relative aspect-4/5 w-full overflow-hidden bg-neutral-900 lg:col-span-7 lg:aspect-auto lg:min-h-[70svh]">
            <Image
              src={featured.cover}
              alt={featured.coverAlt}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover transition-transform duration-1100 ease-out group-hover:scale-[1.03]"
            />
            <span className="absolute left-5 top-5 bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
              {featured.category}
            </span>
          </div>

          <div className="relative flex items-center bg-secondary lg:col-span-5">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-6 top-8 font-heading text-[110px] font-light leading-none text-foreground/5 md:text-[150px]">
              01
            </span>
            <div className="relative px-6 py-16 md:px-14 md:py-24 lg:px-16">
              <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/55">
                Em destaque · {featured.date} · {featured.readingTime}
              </p>
              <h2 className="mt-5 font-heading text-4xl font-light leading-[1.05] tracking-tight md:text-6xl">
                {featured.title}
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-foreground/65 md:text-base">
                {featured.excerpt}
              </p>
              <span className="group/cta mt-10 inline-flex items-center gap-3 bg-foreground px-9 py-4 text-[11px] uppercase tracking-[0.25em] text-background transition-opacity group-hover:opacity-90">
                Ler o editorial
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* All stories */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-2xl px-6 py-20 md:px-10 md:py-28">
          <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
            Todas as histórias
          </p>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
            {rest.map((story) => (
              <EditorialCard key={story.slug} story={story} />
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
};

export default EditorialPage;
