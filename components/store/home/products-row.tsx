import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  ProductCard,
  type ProductCardColor,
} from "@/modules/products/components/store/product-card";

export type ProductGridItem = {
  slug: string;
  name: string;
  category?: string;
  price: string;
  comparePrice?: string;
  badge?: string;
  image: string;
  hoverImage?: string;
  colors?: ProductCardColor[];
};

type Props = {
  subtitle?: string;
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  products: ProductGridItem[];
};

export const ProductsRow = ({
  subtitle,
  title,
  viewAllHref,
  viewAllLabel = "Ver todos os produtos",
  products,
}: Props) => {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-screen-2xl px-6 py-20 md:px-10 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            {subtitle && (
              <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
                {subtitle}
              </p>
            )}
            <h2 className="mt-3 font-heading text-3xl font-light leading-tight md:text-5xl">
              {title}
            </h2>
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="group hidden shrink-0 items-center gap-2 pb-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 transition-colors hover:text-foreground md:inline-flex">
              <span className="border-b border-foreground/30 pb-1 transition-colors group-hover:border-foreground">
                {viewAllLabel}
              </span>
            </Link>
          )}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 md:mt-14 md:gap-x-6 md:gap-y-16 lg:grid-cols-4 lg:gap-x-8">
          {products.slice(0, 4).map((product, i) => (
            <ProductCard
              key={product.slug}
              href={`/products/${product.slug}`}
              name={product.name}
              category={product.category}
              price={product.price}
              comparePrice={product.comparePrice}
              badge={product.badge}
              image={product.image}
              hoverImage={product.hoverImage}
              colors={product.colors}
              priority={i === 0}
            />
          ))}
        </div>

        {viewAllHref && (
          <div className="mt-12 flex justify-center md:hidden">
            <Link
              href={viewAllHref}
              className="group inline-flex items-center gap-3 border border-foreground/20 px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-foreground/80 transition-colors hover:border-foreground hover:text-foreground">
              {viewAllLabel}
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
