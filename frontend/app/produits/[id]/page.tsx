import Image from "next/image";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Product } from "@/types";
import { formatPrice, skinTypeLabels } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductGrid } from "@/components/ProductGrid";

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await api.get<{ success: boolean; data: Product }>(`/products/${id}`, {
      auth: false,
      cache: "no-store",
    });
    return res.data;
  } catch {
    return null;
  }
}

async function getRecommendations(id: string): Promise<Product[]> {
  try {
    const res = await api.get<{ success: boolean; data: Product[] }>(
      `/products/${id}/recommendations`,
      { auth: false, cache: "no-store" }
    );
    return res.data;
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const recommendations = await getRecommendations(params.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-12">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface-container-low">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[96px]">spa</span>
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <p className="font-label-md text-label-md uppercase tracking-wide text-primary">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-1 font-headline-xl text-headline-xl text-on-surface">
            {product.brand && <span className="mr-2 text-on-surface-variant">{product.brand}</span>}
            {product.name}
          </h1>
          <p className="mt-3 font-price-lg text-[28px] font-bold leading-tight text-on-surface">
            {formatPrice(product.price)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary-fixed px-3 py-1 font-label-sm text-label-sm font-semibold text-on-secondary-fixed">
              {skinTypeLabels[product.skinType]}
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold ${
                product.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-error-container text-on-error-container"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-error"}`} />
              {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
            </span>
          </div>

          <p className="mt-6 font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
            {product.description}
          </p>

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 flex items-center gap-2 font-headline-lg text-headline-lg text-on-surface">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            Vous pourriez également aimer
          </h2>
          <ProductGrid products={recommendations} />
        </section>
      )}
    </div>
  );
}
