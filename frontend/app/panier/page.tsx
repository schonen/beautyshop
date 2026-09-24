"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/Button";

export default function PanierPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  function handleGoToCheckout() {
    router.push(user ? "/checkout" : "/connexion?next=/checkout");
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <span className="material-symbols-outlined mb-4 text-[64px] text-outline">shopping_bag</span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Ton panier est vide</h1>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
          Parcours le catalogue pour trouver ton bonheur.
        </p>
        <Link href="/produits" className="mt-6 inline-block">
          <Button>Voir les produits</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-12">
      <h1 className="mb-6 font-headline-xl text-headline-xl text-on-surface">Mon panier</h1>

      <div className="divide-y divide-surface-container rounded-2xl border border-surface-container bg-surface-container-lowest">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-4 p-4">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-container-low">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-[28px]">spa</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <Link
                href={`/produits/${product.id}`}
                className="font-label-md text-label-md text-on-surface hover:text-primary"
              >
                {product.name}
              </Link>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{formatPrice(product.price)}</p>
            </div>
            <div className="flex items-center rounded-full border border-outline-variant">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="w-6 text-center font-label-sm text-label-sm">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                disabled={quantity >= product.stock}
                className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
            <p className="w-24 text-right font-price-md text-price-md text-on-surface">
              {formatPrice(Number(product.price) * quantity)}
            </p>
            <button
              onClick={() => removeItem(product.id)}
              aria-label="Retirer"
              className="rounded-full p-1.5 text-outline hover:bg-error-container hover:text-error"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-3 rounded-2xl border border-surface-container bg-surface-container-lowest p-5">
          <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
            <span>Sous-total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between font-price-lg text-price-lg text-on-surface">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button onClick={handleGoToCheckout} className="w-full">
            Passer au checkout
          </Button>
          <p className="flex items-center justify-center gap-1 text-center font-body-sm text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            Livraison dans la ville de la boutique ou retrait en boutique
          </p>
        </div>
      </div>
    </div>
  );
}
