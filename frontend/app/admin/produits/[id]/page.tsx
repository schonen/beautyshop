"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Product } from "@/types";
import { ProductForm } from "@/components/ProductForm";
import { Spinner } from "@/components/Alert";

export default function ModifierProduitPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ success: boolean; data: Product }>(`/products/${params.id}`)
      .then((res) => setProduct(res.data))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!product) return <p className="font-body-md text-body-md text-outline">Produit introuvable.</p>;

  return (
    <div>
      <h1 className="mb-6 font-headline-xl text-headline-xl text-on-surface">Modifier « {product.name} »</h1>
      <ProductForm initialProduct={product} />
    </div>
  );
}
