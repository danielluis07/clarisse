import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const CollectionExploreLink = () => (
  <section className="border-y border-foreground/10 bg-secondary">
    <div className="mx-auto flex max-w-screen-2xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between md:px-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
          Continue explorando
        </p>
        <h2 className="mt-3 font-heading text-3xl font-light leading-tight md:text-4xl">
          Veja todas as coleções
        </h2>
      </div>
      <Link
        href="/colecoes"
        className="group inline-flex items-center gap-3 bg-foreground px-9 py-4 text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90">
        Ver coleções
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  </section>
);
