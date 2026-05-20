import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const ProductCard = ({
  href,
  name,
  category,
  price,
  comparePrice,
  image,
  hoverImage,
  badge,
}: {
  href: string;
  name: string;
  category?: string;
  price: string;
  comparePrice?: string;
  image: string;
  hoverImage?: string;
  badge?: string;
}) => {
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-3/4 w-full overflow-hidden bg-foreground/3">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-900 ease-out group-hover:scale-[1.03]"
        />
        {hoverImage && (
          <Image
            src={hoverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
            aria-hidden="true"
          />
        )}
        {badge && (
          <span className="absolute left-3 top-3 bg-background/90 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {category && (
            <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/55">
              {category}
            </p>
          )}
          <h3 className="mt-1 truncate font-heading text-base font-normal text-foreground transition-opacity group-hover:opacity-70">
            {name}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm tabular-nums text-foreground">{price}</p>
          {comparePrice && (
            <p className="text-xs tabular-nums text-foreground/45 line-through">
              {comparePrice}
            </p>
          )}
        </div>
      </div>

      <span className="mt-4 flex items-center justify-center gap-2 border border-foreground/15 px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-foreground/75 transition-colors group-hover:border-foreground group-hover:text-foreground">
        Ver detalhes
        <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
};
