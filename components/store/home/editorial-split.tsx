import Image from "next/image";
import Link from "next/link";

export const EditorialSplit = () => {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 lg:grid-cols-2">
        <div className="relative aspect-[4/5] w-full overflow-hidden lg:aspect-auto lg:min-h-[680px]">
          <Image
            src="https://images.unsplash.com/photo-1581338834647-b0fb40704e21?q=80&w=2000&auto=format&fit=crop"
            alt="Editorial de campanha Clarisse"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex items-center bg-background px-6 py-20 md:px-16 md:py-24 lg:px-24">
          <div className="max-w-md">
            <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/55">
              A marca
            </p>
            <h2 className="mt-6 font-heading text-4xl font-light leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              Vestir-se com
              <br />
              <span className="italic">intenção.</span>
            </h2>
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-foreground/70 md:text-base">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
                dolor in reprehenderit in voluptate velit.
              </p>
            </div>
            <Link
              href="/sobre"
              className="mt-10 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-foreground"
            >
              <span className="border-b border-foreground/40 pb-1 transition-colors hover:border-foreground">
                Sobre Clarisse
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
