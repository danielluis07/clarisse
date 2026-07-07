import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductBreadcrumb } from "@/modules/products/components/store/product-breadcrumb";
import { EditorialCard } from "@/components/store/editorial/editorial-card";
import { Newsletter } from "@/components/store/home/newsletter";
import {
  getEditorialBySlug,
  getEditorials,
  getRelatedEditorials,
  type EditorialBlock,
} from "@/lib/placeholder/editorial";

export const generateStaticParams = () =>
  getEditorials().map((story) => ({ slug: story.slug }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const story = getEditorialBySlug(slug);

  if (!story) return { title: "Editorial | Clarisse" };

  return {
    title: `${story.title} | Editorial Clarisse`,
    description: story.excerpt,
  };
};

const EditorialBlockView = ({ block }: { block: EditorialBlock }) => {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="mt-14 font-heading text-3xl font-light leading-tight tracking-tight md:text-4xl">
          {block.text}
        </h2>
      );
    case "quote":
      return (
        <figure className="my-14 border-y border-foreground/10 py-10 text-center">
          <blockquote className="mx-auto max-w-2xl font-heading text-2xl font-light italic leading-[1.4] tracking-tight text-foreground/85 md:text-3xl">
            “{block.text}”
          </blockquote>
          {block.cite && (
            <figcaption className="mt-6 text-[10px] uppercase tracking-[0.28em] text-foreground/50">
              {block.cite}
            </figcaption>
          )}
        </figure>
      );
    case "image":
      return (
        <figure className="my-14">
          <div className="relative aspect-16/10 w-full overflow-hidden bg-foreground/5">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="(min-width: 768px) 70vw, 100vw"
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-4 text-[11px] uppercase tracking-[0.2em] text-foreground/45">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      return (
        <p className="mt-7 text-base leading-[1.85] text-foreground/75 first:mt-0">
          {block.text}
        </p>
      );
  }
};

const EditorialStoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const story = getEditorialBySlug(slug);

  if (!story) notFound();

  const related = getRelatedEditorials(slug, 3);

  return (
    <>
      <ProductBreadcrumb
        crumbs={[
          { label: "Início", href: "/" },
          { label: "Editorial", href: "/editorial" },
          { label: story.title },
        ]}
      />

      {/* Article hero */}
      <section className="relative isolate flex min-h-[78svh] w-full items-end overflow-hidden bg-neutral-900">
        <Image
          src={story.cover}
          alt={story.coverAlt}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-black/75 via-black/25 to-black/10"
        />
        <div className="mx-auto w-full max-w-3xl px-6 pb-16 pt-28 text-center md:pb-24">
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/75">
            {story.category}
          </p>
          <h1 className="mt-6 font-heading text-4xl font-light leading-[1.02] tracking-tight text-white md:text-6xl lg:text-7xl">
            {story.title}
          </h1>
          <div className="mt-8 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/65">
            <span>{story.author}</span>
            <span className="h-px w-6 bg-white/40" />
            <span>{story.date}</span>
            <span className="h-px w-6 bg-white/40" />
            <span>{story.readingTime}</span>
          </div>
        </div>
      </section>

      {/* Article body */}
      <article className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <p className="mb-12 border-l-2 border-foreground/80 pl-6 font-heading text-xl font-light leading-normal tracking-tight text-foreground/85 md:text-2xl">
            {story.excerpt}
          </p>
          {story.body.map((block, index) => (
            <EditorialBlockView key={index} block={block} />
          ))}

          {/* Signature */}
          <div className="mt-16 flex items-center gap-4 border-t border-foreground/10 pt-8">
            <span className="h-px w-10 bg-foreground/30" />
            <p className="text-[11px] uppercase tracking-[0.26em] text-foreground/55">
              Por {story.author}
            </p>
          </div>
        </div>
      </article>

      {/* Related stories */}
      {related.length > 0 && (
        <section className="bg-background">
          <div className="mx-auto max-w-screen-2xl px-6 py-16 md:px-10 md:py-24">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
                  Continue lendo
                </p>
                <h2 className="mt-3 font-heading text-3xl font-light leading-tight md:text-4xl">
                  Mais do editorial
                </h2>
              </div>
              <Link
                href="/editorial"
                className="group hidden shrink-0 items-center gap-2 pb-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 transition-colors hover:text-foreground md:inline-flex"
              >
                <span className="border-b border-foreground/30 pb-1 transition-colors group-hover:border-foreground">
                  Ver tudo
                </span>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
              {related.map((item) => (
                <EditorialCard key={item.slug} story={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Newsletter />
    </>
  );
};

export default EditorialStoryPage;
