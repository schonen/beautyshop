"use client";

import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/lib/cart-context";
import { Button } from "./Button";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock === 0;

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-full border border-outline-variant">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
          aria-label="Diminuer la quantité"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>
        <span className="w-8 text-center font-label-md text-label-md">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
          aria-label="Augmenter la quantité"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>

      <Button onClick={handleAdd} disabled={outOfStock} size="lg" className="flex-1 gap-2">
        <span className="material-symbols-outlined text-[20px]">
          {added ? "check_circle" : "add_shopping_cart"}
        </span>
        {outOfStock ? "Rupture de stock" : added ? "Ajouté au panier" : "Ajouter au panier"}
      </Button>
    </div>
  );
}
