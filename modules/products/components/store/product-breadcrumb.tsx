import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const ProductBreadcrumb = ({
  crumbs,
}: {
  crumbs: { label: string; href?: string }[];
}) => {
  return (
    <nav
      aria-label="Caminho de navegação"
      className="border-b border-foreground/10 bg-background">
      <ol className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-2 px-6 py-4 text-[10px] uppercase tracking-[0.22em] text-foreground/55 md:px-10">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-2">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="transition-colors hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span
                  className={last ? "text-foreground/80" : "text-foreground/55"}
                  aria-current={last ? "page" : undefined}>
                  {c.label}
                </span>
              )}
              {!last && (
                <ChevronRight
                  className="size-3 text-foreground/30"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
