import { ProductsRow } from "@/components/store/home/products-row";
import { mapStoreProduct } from "@/lib/map-store-product";
import { getStoreProducts } from "@/modules/products/server/storefront";

export const NewProducts = async () => {
  const { data } = await getStoreProducts({
    perPage: 4,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });

  if (!data.length) return null;

  return (
    <section id="new-products">
      <ProductsRow
        subtitle="Recém-chegadas"
        title="Novidades"
        viewAllHref="/products"
        viewAllLabel="Ver todos os produtos"
        products={data.map((product, index) =>
          mapStoreProduct(product, index, "Novo"),
        )}
      />
    </section>
  );
};
