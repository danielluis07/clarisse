import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section className="bg-background">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-20 md:px-10">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border border-foreground/10" />
            <div className="flex size-14 items-center justify-center rounded-full border border-foreground/15 bg-background shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
              <Skeleton className="size-5 rounded-full bg-foreground/15" />
            </div>
          </div>

          <Skeleton className="mt-8 h-3 w-24 rounded-full bg-foreground/10" />
          <Skeleton className="mt-5 h-11 w-[min(18rem,85vw)] rounded-none bg-foreground/10 md:h-14 md:w-[min(28rem,85vw)]" />
          <Skeleton className="mt-5 h-4 w-full max-w-xl rounded-full bg-foreground/10" />
          <Skeleton className="mt-2 h-4 w-[78%] max-w-lg rounded-full bg-foreground/10" />

          <Skeleton className="mt-6 h-3 w-32 rounded-full bg-foreground/10" />

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Skeleton className="h-11 w-44 rounded-none bg-foreground/10" />
            <Skeleton className="h-11 w-40 rounded-none bg-foreground/10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Loading;
