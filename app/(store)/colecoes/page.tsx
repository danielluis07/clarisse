import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CollectionCard } from "@/modules/collections/components/collection-card";
import { Newsletter } from "@/components/store/home/newsletter";
import {
  getCollectionDescription,
  getCollectionEyebrow,
  getCollectionImage,
} from "@/modules/collections/components/collection-utils";
import { getStoreCollections } from "@/modules/collections/server/storefront";

export const metadata: Metadata = {
  title: "Coleções | Clarisse",
  description:
    "Explore as coleções editoriais e sazonais da Clarisse: alfaiataria leve, vestidos minimais, edição noite e a cápsula essencial.",
};

const CollectionsPage = async () => {
  const collections = await getStoreCollections();
  const [featured, ...rest] = collections;

  if (collections.length === 0) {
    return (
      <>
        {/* Editorial page header */}
        <section className="border-b border-foreground/10 bg-background">
          <div className="mx-auto max-w-screen-2xl px-6 pb-14 pt-16 md:px-10 md:pb-20 md:pt-24">
            <p className="text-[11px] uppercase tracking-[0.4em] text-foreground/50">
              Coleções
            </p>
            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
              <h1 className="font-heading text-5xl font-light leading-[0.95] tracking-tight md:text-7xl lg:col-span-8">
                Curadorias para
                <br />
                vestir com intenção
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-foreground/65 lg:col-span-4 lg:justify-self-end">
                Reunimos cada estação e cada ideia em coleções pensadas para
                durar. Comece pela curadoria que conversa com o seu momento.
              </p>
            </div>
          </div>
        </section>

        {/* Empty state */}
        <section className="bg-background">
          <div className="mx-auto max-w-screen-2xl px-6 py-20 md:px-10 md:py-28">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-foreground/65">
                Nenhuma coleção disponível no momento. Volte em breve.
              </p>
            </div>
          </div>
        </section>

        <Newsletter />
      </>
    );
  }

  const featureImageData = getCollectionImage(featured);
  const featureDescription = getCollectionDescription(featured);
  const featureEyebrow = getCollectionEyebrow(featured);

  return (
    <>
      {/* Editorial page header */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-screen-2xl px-6 pb-14 pt-16 md:px-10 md:pb-20 md:pt-24">
          <p className="text-[11px] uppercase tracking-[0.4em] text-foreground/50">
            Coleções
          </p>
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <h1 className="font-heading text-5xl font-light leading-[0.95] tracking-tight md:text-7xl lg:col-span-8">
              Curadorias para
              <br />
              vestir com intenção
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-foreground/65 lg:col-span-4 lg:justify-self-end">
              Reunimos cada estação e cada ideia em coleções pensadas para
              durar. Comece pela curadoria que conversa com o seu momento.
            </p>
          </div>
        </div>
      </section>

      {/* Featured collection — full-bleed editorial banner */}
      <section className="border-b border-foreground/10 bg-foreground">
        <Link
          href={`/colecoes/${featured.slug}`}
          className="group relative isolate flex min-h-[72svh] w-full items-end overflow-hidden"
        >
          <Image
            src={featureImageData.src}
            alt={featureImageData.alt}
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover transition-transform duration-1100 ease-out group-hover:scale-[1.03]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/20 to-black/10"
          />
          <div className="mx-auto w-full max-w-screen-2xl px-6 pb-14 md:px-10 md:pb-20">
            <div className="max-w-xl">
              <p className="text-[10px] uppercase tracking-[0.32em] text-white/70">
                {featureEyebrow}
              </p>
              <h2 className="mt-5 font-heading text-4xl font-light leading-[1.02] tracking-tight text-white md:text-6xl">
                {featured.name}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75 md:text-base">
                {featureDescription}
              </p>
              <span className="mt-8 inline-flex items-center gap-3 bg-white px-9 py-4 text-[11px] uppercase tracking-[0.25em] text-black transition-colors group-hover:bg-white/90">
                Descobrir a coleção
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* All collections grid */}
      {rest.length > 0 && (
        <section className="bg-background">
          <div className="mx-auto max-w-screen-2xl px-6 py-20 md:px-10 md:py-28">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
                  Todas as coleções
                </p>
                <h2 className="mt-3 font-heading text-3xl font-light leading-tight md:text-5xl">
                  Explore por curadoria
                </h2>
              </div>
              <Link
                href="/products"
                className="group hidden shrink-0 items-center gap-2 pb-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 transition-colors hover:text-foreground md:inline-flex"
              >
                <span className="border-b border-foreground/30 pb-1 transition-colors group-hover:border-foreground">
                  Ver todo o catálogo
                </span>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-3 md:mt-14 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {rest.map((collection, index) => (
                <CollectionCard
                  key={collection.slug}
                  collection={collection}
                  className="aspect-4/5"
                  titleClassName="text-2xl md:text-3xl"
                  priority={index < 3}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Newsletter />
    </>
  );
};

export default CollectionsPage;
