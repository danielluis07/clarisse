import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoreCategories } from "@/modules/categories/storefront";
import type {
  StoreCategoryImage,
  StoreCategory,
} from "@/modules/categories/types";

type CategoryCardData = {
  name: string;
  href: {
    pathname: "/products";
    query: {
      categoryId: string;
    };
  };
  image: string;
  imageAlt: string;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
] as const;

const getCategoryImageAlt = (image: StoreCategoryImage | null, name: string) =>
  image?.altText ?? name;

const mapStoreCategory = (
  category: StoreCategory,
  index: number,
): CategoryCardData => ({
  name: category.name,
  href: {
    pathname: "/products",
    query: {
      categoryId: category.id,
    },
  },
  image: category.image?.url ?? fallbackImages[index % fallbackImages.length],
  imageAlt: getCategoryImageAlt(category.image, category.name),
});

export const CategoriesGrid = async () => {
  const categories = (await getStoreCategories({ limit: 6 })).map(
    mapStoreCategory,
  );
  const featured = categories.slice(0, 2);
  const secondary = categories.slice(2);

  if (!categories.length) {
    return null;
  }

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-screen-2xl px-6 py-20 md:px-10 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
              Categorias
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light leading-tight md:text-5xl">
              Compre por categoria
            </h2>
          </div>
          <Link
            href="/categorias"
            className="group hidden shrink-0 items-center gap-2 pb-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 transition-colors hover:text-foreground md:inline-flex">
            <span className="border-b border-foreground/30 pb-1 transition-colors group-hover:border-foreground">
              Ver todas
            </span>
          </Link>
        </div>

        {featured.length ? (
          <div className="mt-10 grid grid-cols-1 gap-3 md:mt-14 md:grid-cols-2 md:gap-6">
            {featured.map((category) => (
              <CategoryCard
                key={category.href.query.categoryId}
                category={category}
                className="aspect-4/5 md:aspect-16/11"
                titleClassName="text-2xl md:text-3xl"
              />
            ))}
          </div>
        ) : null}

        {secondary.length ? (
          <div className="mt-3 grid grid-cols-2 gap-3 md:mt-6 md:gap-6 lg:grid-cols-4">
            {secondary.map((category) => (
              <CategoryCard
                key={category.href.query.categoryId}
                category={category}
                className="aspect-3/4"
                titleClassName="text-xl md:text-2xl"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

const CategoryCard = ({
  category,
  className,
  titleClassName,
}: {
  category: CategoryCardData;
  className?: string;
  titleClassName?: string;
}) => {
  return (
    <Link
      href={category.href}
      className={cn(
        "group relative block w-full overflow-hidden bg-foreground/5",
        className,
      )}>
      <Image
        src={category.image}
        alt={category.imageAlt}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover transition-transform duration-1100 ease-out group-hover:scale-105"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 md:p-6">
        <div>
          <h3
            className={cn(
              "font-heading font-light leading-tight text-white",
              titleClassName,
            )}>
            {category.name}
          </h3>
        </div>
        <span className="flex size-9 shrink-0 translate-y-1 items-center justify-center border border-white/40 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
};
