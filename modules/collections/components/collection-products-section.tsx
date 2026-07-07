import { ProductCard } from "@/modules/products/components/store/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { mapStoreProduct } from "@/lib/map-store-product";
import type {
  StoreProduct,
  StoreProductsOutput,
} from "@/modules/products/types";
import { formatPieceCount } from "@/modules/collections/components/collection-utils";

export const CollectionProductsSection = async ({
  productsPromise,
}: {
  productsPromise: Promise<StoreProductsOutput>;
}) => {
  const { data, pagination } = await productsPromise;
  const products = data.map((product, index) =>
    mapStoreProduct(product, index, getProductBadge(product)),
  );

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-screen-2xl px-6 py-16 md:px-10 md:py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
              A seleção
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light leading-tight md:text-4xl">
              Peças desta coleção
            </h2>
          </div>
          <p className="hidden shrink-0 pb-2 text-[11px] uppercase tracking-[0.22em] text-foreground/55 md:block">
            {formatPieceCount(pagination.total)}
          </p>
        </div>

        <div className="mt-10 md:mt-14">
          {products.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:gap-x-6 md:gap-y-16 lg:grid-cols-4 lg:gap-x-8">
              {products.map((product, index) => (
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
                  priority={index < 2}
                />
              ))}
            </div>
          ) : (
            <div className="border-y border-foreground/10 py-20 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/55">
                Nenhuma peça disponível
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl font-heading text-4xl font-light leading-tight md:text-5xl">
                Esta coleção ainda está sendo preparada.
              </h2>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const CollectionProductsSkeleton = () => (
  <section className="bg-background">
    <div className="mx-auto max-w-screen-2xl px-6 py-16 md:px-10 md:py-24">
      <div className="flex items-end justify-between gap-6">
        <div>
          <Skeleton className="h-3 w-28 rounded-none" />
          <Skeleton className="mt-3 h-10 w-72 rounded-none" />
        </div>
        <Skeleton className="hidden h-4 w-24 rounded-none md:block" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 md:mt-14 md:gap-x-6 md:gap-y-16 lg:grid-cols-4 lg:gap-x-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-4">
            <Skeleton className="aspect-3/4 w-full rounded-none" />
            <Skeleton className="h-4 w-3/4 rounded-none" />
            <Skeleton className="h-4 w-1/2 rounded-none" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const getProductBadge = (product: StoreProduct) => {
  if (!product.hasStock) return "Esgotado";
  if (product.isFeatured) return "Edit";
  return "Coleção";
};
