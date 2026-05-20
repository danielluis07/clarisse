import Link from "next/link";
import { ProductCard } from "../product-card";

const products = [
  {
    href: "/produtos/blazer-aurora",
    name: "Blazer Aurora",
    category: "Blazers",
    price: "R$ 1.890",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=1200&auto=format&fit=crop",
    badge: "Novo",
  },
  {
    href: "/produtos/calca-lou",
    name: "Calça Lou",
    category: "Alfaiataria",
    price: "R$ 1.240",
    image:
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=1200&auto=format&fit=crop",
  },
  {
    href: "/produtos/camisa-mira",
    name: "Camisa Mira",
    category: "Camisas",
    price: "R$ 980",
    image:
      "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?q=80&w=1200&auto=format&fit=crop",
  },
  {
    href: "/produtos/vestido-helena",
    name: "Vestido Helena",
    category: "Vestidos",
    price: "R$ 1.640",
    image:
      "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1200&auto=format&fit=crop",
    badge: "Novo",
  },
];

export const NewArrivals = () => {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="flex items-baseline gap-5">
            <span className="hidden font-heading text-2xl italic text-foreground/40 md:inline">
              01
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/55">
                Recém-chegadas
              </p>
              <h2 className="mt-4 font-heading text-4xl font-light leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
                Novidades da estação
              </h2>
            </div>
          </div>
          <Link
            href="/novidades"
            className="text-[11px] uppercase tracking-[0.22em] text-foreground/70 underline-offset-8 transition-colors hover:text-foreground hover:underline"
          >
            Ver todas as novidades
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-x-3 gap-y-12 md:gap-x-6 md:gap-y-16 lg:grid-cols-4 lg:gap-x-8">
          {products.map((p) => (
            <ProductCard key={p.href} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
};
