import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Blazers",
    href: "/categorias/blazers",
    image:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=1400&auto=format&fit=crop",
    label: "01",
  },
  {
    name: "Vestidos",
    href: "/categorias/vestidos",
    image:
      "https://images.unsplash.com/photo-1612722432474-b971cdcea546?q=80&w=1400&auto=format&fit=crop",
    label: "02",
  },
  {
    name: "Alfaiataria",
    href: "/categorias/alfaiataria",
    image:
      "https://images.unsplash.com/photo-1542838687-3c45ce5fdb33?q=80&w=1400&auto=format&fit=crop",
    label: "03",
  },
  {
    name: "Bolsas",
    href: "/categorias/bolsas",
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1400&auto=format&fit=crop",
    label: "04",
  },
];

export const CategoryEdit = () => {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/55">
              Por tipo
            </p>
            <h2 className="mt-4 max-w-xl font-heading text-4xl font-light leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              Atemporal,
              <br />
              <span className="italic">por natureza.</span>
            </h2>
          </div>
          <Link
            href="/categorias"
            className="text-[11px] uppercase tracking-[0.22em] text-foreground/70 underline-offset-8 transition-colors hover:text-foreground hover:underline"
          >
            Ver todas as categorias
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.href} href={cat.href} className="group block">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-foreground/[0.03]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(min-width: 1024px) 22vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                <span className="absolute left-4 top-4 text-[10px] uppercase tracking-[0.3em] text-white/80">
                  {cat.label}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <h3 className="font-heading text-xl font-normal md:text-2xl">
                  {cat.name}
                </h3>
                <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/55 transition-colors group-hover:text-foreground">
                  Explorar
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
