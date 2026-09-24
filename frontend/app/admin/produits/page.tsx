"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiClientError } from "@/lib/api";
import { Paginated, Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/Button";
import { Spinner, Alert } from "@/components/Alert";

export default function AdminProduitsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .get<{ success: boolean } & Paginated<Product>>("/products?limit=100")
      .then((res) => setProducts(res.items))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDeactivate(id: string) {
    if (!confirm("Désactiver ce produit ? Il ne sera plus visible dans le catalogue.")) return;
    setError(null);
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Suppression impossible");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-headline-xl text-headline-xl text-on-surface">Produits</h1>
        <Link href="/admin/produits/nouveau">
          <Button className="gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Ajouter un produit
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-surface-container bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full font-body-sm text-body-sm">
            <thead className="border-b border-surface-container bg-surface-container-low text-left text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-label-sm text-label-sm">Nom</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Catégorie</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Prix</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Stock</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-on-surface">
                    {p.brand && <span className="mr-1 text-on-surface-variant">{p.brand} —</span>}
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-on-surface">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 5 ? "font-semibold text-amber-700" : "text-on-surface-variant"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold ${
                        p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-surface-container-high text-outline"
                      }`}
                    >
                      {p.isActive ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/produits/${p.id}`} className="text-primary hover:underline">
                        Modifier
                      </Link>
                      {p.isActive && (
                        <button onClick={() => handleDeactivate(p.id)} className="text-error hover:underline">
                          Désactiver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <p className="p-8 text-center font-body-md text-body-md text-outline">Aucun produit pour le moment.</p>
        )}
      </div>
    </div>
  );
}
