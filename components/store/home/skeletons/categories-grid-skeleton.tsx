const featuredCards = Array.from({ length: 2 }, (_, index) => index);
const secondaryCards = Array.from({ length: 4 }, (_, index) => index);

export const CategoriesGridSkeleton = () => (
  <section aria-hidden="true" className="bg-background">
    <div className="mx-auto max-w-screen-2xl px-6 py-20 md:px-10 md:py-28">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="h-2.5 w-24 animate-pulse rounded-full bg-foreground/10" />
          <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded-md bg-foreground/10 md:h-14" />
        </div>
        <div className="hidden h-4 w-28 animate-pulse rounded-full bg-foreground/10 md:block" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-3 md:mt-14 md:grid-cols-2 md:gap-6">
        {featuredCards.map((card) => (
          <div
            key={card}
            className="relative aspect-4/5 overflow-hidden bg-foreground/5 md:aspect-16/11"
          >
            <div className="absolute inset-0 animate-pulse bg-linear-to-br from-foreground/10 via-foreground/5 to-foreground/15" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <div className="h-8 w-40 animate-pulse rounded-md bg-white/25 md:h-9" />
              <div className="mt-3 h-2.5 w-24 animate-pulse rounded-full bg-white/20" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:mt-6 md:gap-6 lg:grid-cols-4">
        {secondaryCards.map((card) => (
          <div
            key={card}
            className="relative aspect-3/4 overflow-hidden bg-foreground/5"
          >
            <div className="absolute inset-0 animate-pulse bg-linear-to-br from-foreground/10 via-foreground/5 to-foreground/15" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <div className="h-7 w-28 animate-pulse rounded-md bg-white/25 md:h-8" />
              <div className="mt-3 h-2.5 w-20 animate-pulse rounded-full bg-white/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
