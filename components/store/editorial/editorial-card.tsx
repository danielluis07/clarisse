import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlaceholderEditorial } from "@/lib/placeholder/editorial";

export const EditorialCard = ({
  story,
  className,
  imageClassName,
  titleClassName,
  priority = false,
}: {
  story: PlaceholderEditorial;
  className?: string;
  imageClassName?: string;
  titleClassName?: string;
  priority?: boolean;
}) => {
  return (
    <Link
      href={`/editorial/${story.slug}`}
      className={cn("group block", className)}>
      <div
        className={cn(
          "relative aspect-4/5 w-full overflow-hidden bg-foreground/5",
          imageClassName,
        )}>
        <Image
          src={story.cover}
          alt={story.coverAlt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-1100 ease-out group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 bg-background/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
          {story.category}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/50">
          {story.date} · {story.readingTime}
        </p>
        <h3
          className={cn(
            "mt-3 font-heading text-2xl font-light leading-tight tracking-tight text-foreground transition-opacity group-hover:opacity-70",
            titleClassName,
          )}>
          {story.title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/65">
          {story.excerpt}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 transition-colors group-hover:text-foreground">
          Ler o editorial
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
};
