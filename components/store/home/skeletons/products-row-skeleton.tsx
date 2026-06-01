const productCards = Array.from({ length: 4 }, (_, index) => index);

export const ProductsRowSkeleton = () => (
  <section aria-hidden="true" className="bg-background">
    <div className="mx-auto max-w-screen-2xl px-6 py-20 md:px-10 md:py-28">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="h-2.5 w-36 animate-pulse rounded-full bg-foreground/10" />
          <div className="mt-4 h-10 w-64 max-w-full animate-pulse rounded-md bg-foreground/10 md:h-14" />
        </div>
        <div className="hidden h-4 w-40 animate-pulse rounded-full bg-foreground/10 md:block" />
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 md:mt-14 md:gap-x-6 md:gap-y-16 lg:grid-cols-4 lg:gap-x-8">
        {productCards.map((card) => (
          <div key={card}>
            <div className="aspect-3/4 w-full animate-pulse bg-foreground/5" />
            <div className="mt-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="h-2.5 w-20 animate-pulse rounded-full bg-foreground/10" />
                <div className="mt-3 h-4 w-32 max-w-full animate-pulse rounded-md bg-foreground/10" />
                <div className="mt-3 flex gap-1.5">
                  <div className="size-3 animate-pulse rounded-full bg-foreground/10" />
                  <div className="size-3 animate-pulse rounded-full bg-foreground/10" />
                  <div className="size-3 animate-pulse rounded-full bg-foreground/10" />
                </div>
              </div>
              <div className="h-4 w-20 animate-pulse rounded-md bg-foreground/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
