import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlaceholderCollection } from "@/lib/placeholder/collections";

export const CollectionCard = ({
  collection,
  className,
  titleClassName,
  priority = false,
}: {
  collection: PlaceholderCollection;
  className?: string;
  titleClassName?: string;
  priority?: boolean;
}) => {
  return (
    <Link
      href={`/colecoes/${collection.slug}`}
      className={cn(
        "group relative block w-full overflow-hidden bg-foreground/5",
        className,
      )}>
      <Image
        src={collection.image}
        alt={collection.imageAlt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover transition-transform duration-1100 ease-out group-hover:scale-105"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-8">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/65">
            {collection.eyebrow} · {collection.productCount} peças
          </p>
          <h3
            className={cn(
              "mt-2 font-heading font-light leading-tight text-white",
              titleClassName,
            )}>
            {collection.name}
          </h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/75">
            {collection.tagline}
          </p>
        </div>
        <span className="flex size-10 shrink-0 translate-y-1 items-center justify-center border border-white/40 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
};
