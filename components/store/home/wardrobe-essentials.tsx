import Link from "next/link";
import { ProductCard } from "../product-card";

const essentials = [
  {
    href: "/produtos/camisa-clara",
    name: "Camisa Clara",
    category: "Camisas",
    price: "R$ 890",
    image:
      "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?q=80&w=1200&auto=format&fit=crop",
  },
  {
    href: "/produtos/calca-pietra",
    name: "Calça Pietra",
    category: "Alfaiataria",
    price: "R$ 1.290",
    image:
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=1200&auto=format&fit=crop",
  },
  {
    href: "/produtos/bolsa-elise",
    name: "Bolsa Élise",
    category: "Bolsas",
    price: "R$ 2.340",
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1200&auto=format&fit=crop",
  },
];

export const WardrobeEssentials = () => {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:gap-16 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/55">
              O guarda-roupa essencial
            </p>
            <h2 className="mt-4 font-heading text-4xl font-light leading-[1.05] tracking-tight md:text-5xl">
              Peças que
              <br />
              <span className="italic">permanecem.</span>
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-foreground/70 md:text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <Link
              href="/colecoes/essenciais"
              className="mt-10 inline-flex items-center gap-3 self-start text-[11px] uppercase tracking-[0.22em] text-foreground"
            >
              <span className="border-b border-foreground/40 pb-1 transition-colors hover:border-foreground">
                Ver edição completa
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8 lg:col-span-8">
            {essentials.map((p) => (
              <ProductCard key={p.href} {...p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
