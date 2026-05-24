"use client";

import { ProductCard } from "@/components/store/product-card";
import { ProductsPagination } from "@/components/store/products/products-pagination";
import { ProductsToolbar } from "@/components/store/products/products-toolbar";
import { centsToReais } from "@/lib/utils";
import { useStoreProductsSuspense } from "@/modules/products/hooks";
import { parseStoreProductsSearchParams } from "@/modules/products/utils";
import { useSearchParams } from "next/navigation";

export const ProductsGrid = () => {
  const searchParams = useSearchParams();
  const parsedParams = parseStoreProductsSearchParams(
    Object.fromEntries(searchParams.entries()),
  );
  const { data: products } = useStoreProductsSuspense(parsedParams);
  const { data, pagination } = products;

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-12 px-6 md:px-10">
        <ProductsToolbar total={pagination.total} />

        {data.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:gap-x-6 md:gap-y-16 lg:grid-cols-4 lg:gap-x-8">
            {data.map((product, index) => {
              const fallback =
                FALLBACK_PRODUCT_IMAGES[index % FALLBACK_PRODUCT_IMAGES.length];
              const price = centsToReais(product.basePriceCents);
              const comparePrice =
                product.compareAtPriceCents &&
                product.compareAtPriceCents > product.basePriceCents
                  ? centsToReais(product.compareAtPriceCents)
                  : undefined;

              return (
                <ProductCard
                  key={product.id}
                  href={`/products/${product.slug}`}
                  name={product.name}
                  category={product.category?.name ?? undefined}
                  price={price}
                  comparePrice={comparePrice}
                  image={product.primaryImage?.url ?? fallback.image}
                  hoverImage={product.hoverImage?.url ?? fallback.hoverImage}
                  badge={getProductBadge({
                    isFeatured: product.isFeatured,
                    hasStock: product.hasStock,
                    page: pagination.page,
                    index,
                  })}
                />
              );
            })}
          </div>
        ) : (
          <ProductsEmptyState search={parsedParams.search} />
        )}

        <ProductsPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          perPage={pagination.perPage}
        />
      </div>
    </section>
  );
};

const getProductBadge = ({
  isFeatured,
  hasStock,
  page,
  index,
}: {
  isFeatured: boolean;
  hasStock: boolean;
  page: number;
  index: number;
}) => {
  if (!hasStock) return "Esgotado";
  if (isFeatured) return "Edit";
  if (page === 1 && index < 3) return "Novo";
  return undefined;
};

const ProductsEmptyState = ({ search }: { search?: string }) => {
  return (
    <div className="border-y border-foreground/10 py-20 text-center">
      <p className="text-xs uppercase text-foreground/55">Nenhum resultado</p>
      <h2 className="mx-auto mt-4 max-w-2xl font-heading text-4xl font-light leading-tight md:text-5xl">
        Não encontramos peças para esta busca.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-foreground/65">
        {search
          ? `Revise "${search}" ou explore o catálogo completo da Clarisse.`
          : "Explore o catálogo completo da Clarisse em outro momento."}
      </p>
    </div>
  );
};

const FALLBACK_PRODUCT_IMAGES = [
  {
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    image:
      "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=1200&auto=format&fit=crop",
  },
  {
    image:
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?q=80&w=1200&auto=format&fit=crop",
  },
];
