import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { ProductBreadcrumb } from "@/components/store/product/product-breadcrumb";
import { PlaceholderProductGrid } from "@/components/store/placeholder-product-grid";
import { Newsletter } from "@/components/store/home/newsletter";
import {
  getCollectionBySlug,
  getCollections,
} from "@/lib/placeholder/collections";
import { getPlaceholderProducts } from "@/lib/placeholder/products";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export const generateStaticParams = () =>
  getCollections().map((collection) => ({ slug: collection.slug }));

export const generateMetadata = async ({
  params,
}: CollectionPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) return { title: "Coleção | Clarisse" };

  return {
    title: `${collection.name} | Clarisse`,
    description: collection.description,
  };
};

const CollectionDetailPage = async ({ params }: CollectionPageProps) => {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) notFound();

  const products = getPlaceholderProducts(8);

  return (
    <>
      <ProductBreadcrumb
        crumbs={[
          { label: "Início", href: "/" },
          { label: "Coleções", href: "/colecoes" },
          { label: collection.name },
        ]}
      />

      {/* Collection hero */}
      <section className="relative isolate flex min-h-[68svh] w-full items-end overflow-hidden bg-neutral-900">
        <Image
          src={collection.image}
          alt={collection.imageAlt}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/20 to-black/5"
        />
        <div className="mx-auto w-full max-w-screen-2xl px-6 pb-16 pt-28 md:px-10 md:pb-20">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.36em] text-white/75">
              {collection.eyebrow} · {collection.season}
            </p>
            <h1 className="mt-6 font-heading text-5xl font-light leading-[0.95] tracking-tight text-white md:text-7xl">
              {collection.name}
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
              {collection.description}
            </p>
          </div>
        </div>
        <span className="absolute bottom-8 right-6 hidden items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/55 md:right-10 md:flex">
          <span className="h-px w-10 bg-white/40" />
          {collection.productCount} peças
        </span>
      </section>

      {/* Highlights strip */}
      <section className="border-b border-foreground/10 bg-secondary">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
          <ul className="grid grid-cols-1 divide-y divide-foreground/10 sm:grid-cols-3 sm:divide-y-0">
            {collection.highlights.map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-4 py-8 sm:border-l sm:border-foreground/10 sm:px-8 sm:first:border-l-0 sm:first:pl-0">
                <span className="font-heading text-2xl font-light text-foreground/30 tabular-nums">
                  0{index + 1}
                </span>
                <span className="text-sm text-foreground/75">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Products in the collection */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-2xl px-6 py-16 md:px-10 md:py-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
                A seleção
              </p>
              <h2 className="mt-3 font-heading text-3xl font-light leading-tight md:text-4xl">
                Peças desta coleção
              </h2>
            </div>
            <p className="hidden shrink-0 pb-2 text-[11px] uppercase tracking-[0.22em] text-foreground/55 md:block">
              {collection.productCount} peças
            </p>
          </div>

          <div className="mt-10 md:mt-14">
            <PlaceholderProductGrid products={products} />
          </div>
        </div>
      </section>

      {/* Cross-link back to all collections */}
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

      <Newsletter />
    </>
  );
};

export default CollectionDetailPage;
