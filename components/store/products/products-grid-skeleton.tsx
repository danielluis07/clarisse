import { Skeleton } from "@/components/ui/skeleton";

export const ProductsGridSkeleton = () => {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-12 px-6 md:px-10">
        <div className="flex flex-col gap-4 border-y border-foreground/10 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Skeleton className="h-4 w-36 rounded-none" />
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:flex-1 md:justify-end">
            <Skeleton className="h-11 w-full rounded-none md:max-w-2xl lg:max-w-3xl" />
            <Skeleton className="h-11 w-48 rounded-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:gap-x-6 md:gap-y-16 lg:grid-cols-4 lg:gap-x-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-4">
              <Skeleton className="aspect-3/4 w-full rounded-none" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-20 rounded-none" />
                  <Skeleton className="h-5 w-3/4 rounded-none" />
                </div>
                <Skeleton className="h-4 w-16 rounded-none" />
              </div>
              <Skeleton className="h-11 w-full rounded-none" />
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-foreground/10 pt-6 sm:flex-row">
          <Skeleton className="h-4 w-48 rounded-none" />
          <Skeleton className="h-9 w-72 rounded-none" />
        </div>
      </div>
    </section>
  );
};

export const ProductsGridError = () => {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <div className="border-y border-foreground/10 py-16">
          <p className="text-sm text-foreground/65">
            Não foi possível carregar os produtos agora.
          </p>
        </div>
      </div>
    </section>
  );
};
