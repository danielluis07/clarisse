import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = {
  name: string;
  count: string;
  href: string;
  image: string;
};

const featured: Category[] = [
  {
    name: "Alfaiataria",
    count: "48 peças",
    href: "/categorias/alfaiataria",
    image:
      "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Vestidos",
    count: "36 peças",
    href: "/categorias/vestidos",
    image:
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1600&auto=format&fit=crop",
  },
];

const secondary: Category[] = [
  {
    name: "Camisas",
    count: "27 peças",
    href: "/categorias/camisas",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Saias",
    count: "19 peças",
    href: "/categorias/saias",
    image:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Bolsas",
    count: "23 peças",
    href: "/categorias/bolsas",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Tricô",
    count: "15 peças",
    href: "/categorias/trico",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
  },
];

export const CategoryGrid = () => {
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

        <div className="mt-10 grid grid-cols-1 gap-3 md:mt-14 md:grid-cols-2 md:gap-6">
          {featured.map((category) => (
            <CategoryCard
              key={category.href}
              category={category}
              className="aspect-4/5 md:aspect-16/11"
              titleClassName="text-2xl md:text-3xl"
            />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 md:mt-6 md:gap-6 lg:grid-cols-4">
          {secondary.map((category) => (
            <CategoryCard
              key={category.href}
              category={category}
              className="aspect-3/4"
              titleClassName="text-xl md:text-2xl"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const CategoryCard = ({
  category,
  className,
  titleClassName,
}: {
  category: Category;
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
        alt={category.name}
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
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/65">
            {category.count}
          </p>
        </div>
        <span className="flex size-9 shrink-0 translate-y-1 items-center justify-center border border-white/40 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
};
