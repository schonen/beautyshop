"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api, ApiClientError } from "@/lib/api";
import { Category, Product, SkinType } from "@/types";
import { skinTypeLabels } from "@/lib/format";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Alert } from "@/components/Alert";

const skinTypes: SkinType[] = ["NORMAL", "SEC", "GRAS", "MIXTE", "TOUS"];

interface ProductFormProps {
  initialProduct?: Product; // présent = mode édition, absent = mode création
}

export function ProductForm({ initialProduct }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [form, setForm] = useState({
    brand: initialProduct?.brand ?? "",
    name: initialProduct?.name ?? "",
    description: initialProduct?.description ?? "",
    price: initialProduct?.price ?? "",
    stock: initialProduct?.stock?.toString() ?? "0",
    imageUrl: initialProduct?.imageUrl ?? "",
    skinType: initialProduct?.skinType ?? "TOUS",
    categoryId: initialProduct?.categoryId ?? "",
  });

  useEffect(() => {
    api.get<{ success: boolean; data: Category[] }>("/categories").then((res) => {
      setCategories(res.data);
      if (!form.categoryId && res.data[0]) {
        setForm((f) => ({ ...f, categoryId: res.data[0].id }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => setImageError(false), [form.imageUrl]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      ...form,
      brand: form.brand || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl || undefined,
    };

    try {
      if (initialProduct) {
        await api.put(`/products/${initialProduct.id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      router.push("/admin/produits");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Impossible d'enregistrer le produit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-3xl gap-space-lg lg:grid-cols-[1fr_180px]">
      <div className="space-y-space-md">
        {error && <Alert>{error}</Alert>}

        <Input
          label="Nom du produit"
          icon="spa"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <Input
          label="Marque"
          icon="storefront"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          placeholder="ex: CeraVe, Nivea, Garnier..."
        />

        <div className="space-y-space-xs">
          <label className="flex items-center gap-space-xs font-label-md text-on-surface">
            <span className="material-symbols-outlined text-body-md text-primary">description</span>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={4}
            className="w-full rounded-xl border border-surface-container bg-surface px-space-md py-2.5 font-body-md text-on-surface outline-none focus:bg-surface-container-low"
          />
        </div>

        <div className="grid grid-cols-2 gap-space-md">
          <Input
            label="Prix (FCFA)"
            icon="payments"
            type="number"
            min={0}
            step="1"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <Input
            label="Stock"
            icon="inventory_2"
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-space-md">
          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-md text-on-surface">
              <span className="material-symbols-outlined text-body-md text-primary">category</span>
              Catégorie
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              className="h-12 w-full rounded-xl border border-surface-container bg-surface px-space-md font-body-md text-on-surface"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-space-xs">
            <label className="flex items-center gap-space-xs font-label-md text-on-surface">
              <span className="material-symbols-outlined text-body-md text-primary">face</span>
              Type de peau
            </label>
            <select
              value={form.skinType}
              onChange={(e) => setForm({ ...form, skinType: e.target.value as SkinType })}
              className="h-12 w-full rounded-xl border border-surface-container bg-surface px-space-md font-body-md text-on-surface"
            >
              {skinTypes.map((s) => (
                <option key={s} value={s}>
                  {skinTypeLabels[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="URL de l'image"
          icon="image"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          placeholder="http://localhost:3000/products/creme-hydratante.jpg"
        />
        <p className="-mt-2 font-body-sm text-body-sm text-on-surface-variant">
          Dépose ton fichier dans <code className="rounded bg-surface-container px-1">frontend/public/products/</code>{" "}
          puis colle ici l'URL <strong>complète</strong> (le backend exige une URL valide, pas un chemin relatif) :
          en local <code className="rounded bg-surface-container px-1">http://localhost:3000/products/nom.jpg</code>,
          en production <code className="rounded bg-surface-container px-1">https://ton-site.vercel.app/products/nom.jpg</code>.
          Une image hébergée ailleurs (Cloudinary, etc.) fonctionne aussi.
        </p>

        <div className="flex gap-space-sm pt-space-xs">
          <Button type="submit" loading={loading} className="gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {initialProduct ? "save" : "add_circle"}
            </span>
            {initialProduct ? "Enregistrer les modifications" : "Créer le produit"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </div>

      {/* Aperçu image */}
      <div className="space-y-space-xs">
        <label className="font-label-md text-on-surface">Aperçu</label>
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-surface-container bg-surface-container-low">
          {form.imageUrl && !imageError ? (
            <Image
              src={form.imageUrl}
              alt="Aperçu produit"
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-outline">
              <span className="material-symbols-outlined text-[40px]">
                {imageError ? "broken_image" : "image"}
              </span>
              <span className="px-2 text-center font-body-sm text-body-sm">
                {imageError ? "Image introuvable" : "Aucune image"}
              </span>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
