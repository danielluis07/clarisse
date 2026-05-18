"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const buildPageList = (current: number, total: number, siblings: number) => {
  if (total <= 1) return [1];

  const range: (number | "ellipsis-start" | "ellipsis-end")[] = [];
  const firstPage = 1;
  const lastPage = total;
  const left = Math.max(current - siblings, firstPage + 1);
  const right = Math.min(current + siblings, lastPage - 1);

  range.push(firstPage);

  if (left > firstPage + 1) {
    range.push("ellipsis-start");
  }

  for (let p = left; p <= right; p++) {
    range.push(p);
  }

  if (right < lastPage - 1) {
    range.push("ellipsis-end");
  }

  if (lastPage !== firstPage) {
    range.push(lastPage);
  }

  return range;
};

export const TablePagination = ({
  page,
  totalPages,
  total,
  perPage,
  className,
  siblings = 1,
}: {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  className?: string;
  siblings?: number;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);

  const pages = useMemo(
    () => buildPageList(safePage, safeTotalPages, siblings),
    [safePage, safeTotalPages, siblings],
  );

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(targetPage));
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const goToPage = (targetPage: number) => {
    if (
      targetPage < 1 ||
      targetPage > safeTotalPages ||
      targetPage === safePage
    ) {
      return;
    }
    startTransition(() => {
      router.replace(buildHref(targetPage), { scroll: false });
    });
  };

  const rangeStart = total === 0 ? 0 : (safePage - 1) * perPage + 1;
  const rangeEnd = Math.min(safePage * perPage, total);

  const hasPrevious = safePage > 1;
  const hasNext = safePage < safeTotalPages;

  return (
    <div
      data-pending={isPending ? "" : undefined}
      className={cn(
        "flex flex-col items-center justify-between gap-3 sm:flex-row",
        "data-pending:opacity-70",
        className,
      )}>
      <p className="text-xs text-muted-foreground">
        {total === 0 ? (
          <>Nenhum resultado encontrado.</>
        ) : (
          <>
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            de <span className="font-medium text-foreground">{total}</span>{" "}
            resultados
          </>
        )}
      </p>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={buildHref(safePage - 1)}
              aria-disabled={!hasPrevious}
              data-disabled={!hasPrevious ? "" : undefined}
              className={cn(!hasPrevious && "pointer-events-none opacity-50")}
              onClick={(event) => {
                event.preventDefault();
                goToPage(safePage - 1);
              }}
            />
          </PaginationItem>

          {pages.map((item, index) => {
            if (item === "ellipsis-start" || item === "ellipsis-end") {
              return (
                <PaginationItem key={`${item}-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            const isActive = item === safePage;

            return (
              <PaginationItem key={item}>
                <PaginationLink
                  href={buildHref(item)}
                  isActive={isActive}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    goToPage(item);
                  }}>
                  {item}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href={buildHref(safePage + 1)}
              aria-disabled={!hasNext}
              data-disabled={!hasNext ? "" : undefined}
              className={cn(!hasNext && "pointer-events-none opacity-50")}
              onClick={(event) => {
                event.preventDefault();
                goToPage(safePage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
