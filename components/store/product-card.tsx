import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProductCardColor = {
  name: string;
  hex: string;
};

export const ProductCard = ({
  href,
  name,
  category,
  price,
  comparePrice,
  image,
  hoverImage,
  badge,
  colors,
  priority = false,
  className,
}: {
  href: string;
  name: string;
  category?: string;
  price: string;
  comparePrice?: string;
  image: string;
  hoverImage?: string;
  badge?: string;
  colors?: ProductCardColor[];
  priority?: boolean;
  className?: string;
}) => {
  const visibleColors = colors?.slice(0, 4) ?? [];
  const extraColors = (colors?.length ?? 0) - visibleColors.length;

  return (
    <Link href={href} className={cn("group/card block", className)}>
      <div className="group/image relative aspect-3/4 w-full overflow-hidden bg-foreground/3">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
          preload={priority}
          className={cn(
            "object-cover transition-transform duration-1100 ease-out group-hover/image:scale-[1.04]",
            hoverImage && "group-hover/image:opacity-0",
          )}
        />
        {hoverImage && (
          <Image
            src={hoverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-700 ease-out group-hover/image:opacity-100"
            aria-hidden="true"
          />
        )}

        {badge && (
          <span className="absolute left-3 top-3 z-10 bg-background/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
            {badge}
          </span>
        )}

        {/* Quick-add affordance — slides up on hover (pointer devices). The whole
            card is a link, so this stays a decorative cue toward the product. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden translate-y-full items-center justify-center gap-2 bg-foreground/95 py-3.5 text-[11px] uppercase tracking-[0.22em] text-background opacity-0 transition-all duration-500 ease-out group-hover/image:translate-y-0 group-hover/image:opacity-100 md:flex"
        >
          <ShoppingBag className="size-3.5" />
          Adicionar à sacola
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {category && (
            <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/55">
              {category}
            </p>
          )}
          <h3 className="mt-1 truncate font-heading text-base font-normal text-foreground transition-opacity group-hover/card:opacity-70">
            {name}
          </h3>

          {visibleColors.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5">
              {visibleColors.map((color) => (
                <span
                  key={color.name}
                  title={color.name}
                  className="size-3 rounded-full border border-foreground/15"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
              {extraColors > 0 && (
                <span className="text-[10px] tabular-nums text-foreground/50">
                  +{extraColors}
                </span>
              )}
            </div>
          )}
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
    </Link>
  );
};
