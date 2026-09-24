import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest py-16 text-center">
        <span className="material-symbols-outlined mb-2 text-[40px] text-outline">search_off</span>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Aucun produit ne correspond à ta recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
