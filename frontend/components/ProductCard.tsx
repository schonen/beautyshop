"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-context";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock === 0;

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-surface-container bg-surface-container-lowest p-space-sm shadow-sm transition-all duration-300 hover:shadow-md">
      <Link href={`/produits/${product.id}`}>
        <div className="relative mb-space-sm aspect-square w-full overflow-hidden rounded-lg bg-surface-container-low">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[48px]">spa</span>
            </div>
          )}

          {product.category && (
            <span className="absolute left-2 top-2 rounded-full bg-secondary-fixed px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-fixed">
              {product.category.name}
            </span>
          )}

          <span
            className={`absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold backdrop-blur-sm ${
              outOfStock ? "bg-surface-container-lowest/90 text-error" : "bg-surface-container-lowest/90 text-emerald-700"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${outOfStock ? "bg-error" : "bg-emerald-500"}`} />
            {outOfStock ? "Rupture" : "Stock"}
          </span>
        </div>

        <div className="space-y-1 px-space-xs">
          {product.brand && (
            <p className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant">
              {product.brand}
            </p>
          )}
          <h3 className="line-clamp-2 font-headline-sm text-headline-sm leading-snug text-on-surface transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </div>
      </Link>

      <div className="mt-space-sm space-y-space-sm border-t border-surface-container-high/40 px-space-xs pt-space-md">
        <div className="flex items-baseline justify-between">
          <span className="font-price-lg text-price-lg font-bold text-on-surface">
            {formatPrice(product.price)}
          </span>
        </div>
        <button
          onClick={() => addItem(product, 1)}
          disabled={outOfStock}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-space-md py-2 font-label-md text-label-md text-on-primary shadow-sm transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          <span>{outOfStock ? "Indisponible" : "Ajouter"}</span>
        </button>
      </div>
    </article>
  );
}
