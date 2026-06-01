import { ProductsRow } from "@/components/store/home/products-row";
import { mapStoreProduct } from "@/lib/map-store-product";
import { getStoreProducts } from "@/modules/products/storefront";

export const BestSellersProducts = async () => {
  const { data } = await getStoreProducts({
    perPage: 4,
    sortBy: "random",
  });

  if (!data.length) return null;

  return (
    <ProductsRow
      subtitle="Favoritos da Clarisse"
      title="Mais vendidos"
      viewAllHref="/products"
      viewAllLabel="Ver todos os produtos"
      products={data.map((product, index) =>
        mapStoreProduct(product, index, "Mais vendido"),
      )}
    />
  );
};
