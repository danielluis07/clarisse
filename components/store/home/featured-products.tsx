import { ProductsRow } from "@/components/store/home/products-row";
import { mapStoreProduct } from "@/lib/map-store-product";
import { getStoreProducts } from "@/modules/products/server/storefront";

export const FeaturedProducts = async () => {
  const { data } = await getStoreProducts({
    perPage: 4,
    isFeatured: true,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });

  if (!data.length) return null;

  return (
    <ProductsRow
      subtitle="Seleção da estação"
      title="Em destaque"
      viewAllHref="/products"
      viewAllLabel="Ver todos os produtos"
      products={data.map((product, index) =>
        mapStoreProduct(product, index, "Destaque"),
      )}
    />
  );
};
