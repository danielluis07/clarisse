import { ProductCard } from "@/modules/products/components/store/product-card";
import type { PlaceholderProduct } from "@/lib/placeholder/products";

/**
 * Editorial-styled product grid backed by placeholder data. Matches the
 * spacing of the live catalogue grid so design pages read as production-ready.
 */
export const PlaceholderProductGrid = ({
  products,
}: {
  products: PlaceholderProduct[];
}) => {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:gap-x-6 md:gap-y-16 lg:grid-cols-4 lg:gap-x-8">
      {products.map((product, index) => (
        <ProductCard
          key={`${product.slug}-${index}`}
          href={`/products/${product.slug}`}
          name={product.name}
          category={product.category}
          price={product.price}
          comparePrice={product.comparePrice}
          image={product.image}
          hoverImage={product.hoverImage}
          badge={product.badge}
          colors={product.colors}
        />
      ))}
    </div>
  );
};
