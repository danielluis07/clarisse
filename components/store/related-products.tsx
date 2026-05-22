import Link from "next/link";
import { ProductCard } from "./product-card";

export type RelatedProductCard = {
  href: string;
  name: string;
  category?: string;
  price: string;
  comparePrice?: string;
  image: string;
  hoverImage?: string;
  badge?: string;
};

type RelatedProductsProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  products: RelatedProductCard[];
  index?: string;
};

export const RelatedProducts = ({
  eyebrow = "Complete o look",
  title,
  description,
  ctaLabel,
  ctaHref,
  products,
  index,
}: RelatedProductsProps) => {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-foreground/10 bg-background py-24 md:py-32">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="flex items-baseline gap-5">
            {index && (
              <span className="hidden font-heading text-2xl italic text-foreground/40 md:inline">
                {index}
              </span>
            )}
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/55">
                {eyebrow}
              </p>
              <h2 className="mt-4 font-heading text-3xl font-light leading-[1.05] tracking-tight md:text-4xl lg:text-5xl">
                {title}
              </h2>
              {description && (
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-foreground/70 md:text-base">
                  {description}
                </p>
              )}
            </div>
          </div>
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="text-[11px] uppercase tracking-[0.22em] text-foreground/70 underline-offset-8 transition-colors hover:text-foreground hover:underline"
            >
              {ctaLabel}
            </Link>
          )}
        </div>

        <div className="mt-16 grid grid-cols-2 gap-x-3 gap-y-12 md:gap-x-6 md:gap-y-16 lg:grid-cols-4 lg:gap-x-8">
          {products.map((p) => (
            <ProductCard key={p.href} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
};
