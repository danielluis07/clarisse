import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, type ProductCardColor } from "@/components/store/product-card";

type FeaturedProduct = {
  slug: string;
  name: string;
  category: string;
  price: string;
  comparePrice?: string;
  badge?: string;
  image: string;
  hoverImage: string;
  colors: ProductCardColor[];
};

const products: FeaturedProduct[] = [
  {
    slug: "blazer-aurora",
    name: "Blazer Aurora",
    category: "Alfaiataria",
    price: "R$ 1.290,00",
    comparePrice: "R$ 1.690,00",
    badge: "Novo",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
    colors: [
      { name: "Preto", hex: "#1a1a1a" },
      { name: "Areia", hex: "#d8c8b0" },
      { name: "Caramelo", hex: "#a9784f" },
    ],
  },
  {
    slug: "vestido-elise",
    name: "Vestido Élise",
    category: "Vestidos",
    price: "R$ 980,00",
    badge: "Edit",
    image:
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=1200&auto=format&fit=crop",
    colors: [
      { name: "Off-white", hex: "#efeae1" },
      { name: "Preto", hex: "#161616" },
    ],
  },
  {
    slug: "camisa-oversized-linho",
    name: "Camisa Oversized de Linho",
    category: "Camisas",
    price: "R$ 590,00",
    image:
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop",
    colors: [
      { name: "Branco", hex: "#f4f1ea" },
      { name: "Azul névoa", hex: "#9fb4c7" },
      { name: "Preto", hex: "#161616" },
      { name: "Verde", hex: "#5f6b53" },
    ],
  },
  {
    slug: "trico-gola-alta",
    name: "Tricô Gola Alta",
    category: "Tricô",
    price: "R$ 690,00",
    badge: "Últimas unidades",
    image:
      "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1200&auto=format&fit=crop",
    colors: [
      { name: "Camel", hex: "#b89b74" },
      { name: "Cinza", hex: "#9a9a9a" },
    ],
  },
];

export const FeaturedProducts = () => {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-screen-2xl px-6 py-20 md:px-10 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
              Seleção da estação
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light leading-tight md:text-5xl">
              Em destaque
            </h2>
          </div>
          <Link
            href="/products"
            className="group hidden shrink-0 items-center gap-2 pb-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 transition-colors hover:text-foreground md:inline-flex"
          >
            <span className="border-b border-foreground/30 pb-1 transition-colors group-hover:border-foreground">
              Ver todos os produtos
            </span>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 md:mt-14 md:gap-x-6 md:gap-y-16 lg:grid-cols-4 lg:gap-x-8">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              href={`/products/${product.slug}`}
              name={product.name}
              category={product.category}
              price={product.price}
              comparePrice={product.comparePrice}
              badge={product.badge}
              image={product.image}
              hoverImage={product.hoverImage}
              colors={product.colors}
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center md:hidden">
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 border border-foreground/20 px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
          >
            Ver todos os produtos
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};
