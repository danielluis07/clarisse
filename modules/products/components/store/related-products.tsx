"use client";

import { ProductCard } from "@/modules/products/components/store/product-card";
import { useStoreRelatedProductsSuspense } from "@/modules/products/hooks";
import { buildRelatedProductCard } from "@/modules/products/store-view";

export const RelatedProducts = ({ slug }: { slug: string }) => {
  const { data } = useStoreRelatedProductsSuspense({ slug, limit: 4 });

  const cards = data
    .map(buildRelatedProductCard)
    .filter((card): card is NonNullable<typeof card> => card !== null);

  if (cards.length === 0) return null;

  return (
    <section className="border-t border-foreground/10 bg-background">
      <div className="mx-auto max-w-screen-2xl px-6 py-16 md:px-10 md:py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
              Complete o look
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light leading-tight md:text-4xl">
              Você também pode gostar
            </h2>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 md:mt-14 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {cards.map((card) => (
            <ProductCard key={card.href} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};
