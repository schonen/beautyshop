"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Category, SkinType } from "@/types";
import { skinTypeLabels } from "@/lib/format";
import { api } from "@/lib/api";

const skinTypes: SkinType[] = ["NORMAL", "SEC", "GRAS", "MIXTE", "TOUS"];

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    api
      .get<{ success: boolean; data: Category[] }>("/categories", { auth: false })
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/produits?${params.toString()}`);
  }

  return (
    <div className="mb-space-lg flex flex-col gap-space-sm rounded-2xl border border-surface-container bg-surface-container-lowest p-space-sm shadow-sm sm:flex-row sm:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("search", search);
        }}
        className="relative flex-1"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit ou une marque..."
          className="h-11 w-full rounded-full bg-surface pl-10 pr-4 font-body-md text-body-md text-on-surface outline-none placeholder:text-outline focus:bg-surface-container-low"
        />
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
          search
        </span>
      </form>

      <select
        defaultValue={searchParams.get("categoryId") ?? ""}
        onChange={(e) => updateParam("categoryId", e.target.value)}
        className="h-11 rounded-full border border-surface-container-high bg-surface-container-lowest px-4 font-body-sm text-body-sm text-on-surface"
      >
        <option value="">Toutes catégories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get("skinType") ?? ""}
        onChange={(e) => updateParam("skinType", e.target.value)}
        className="h-11 rounded-full border border-surface-container-high bg-surface-container-lowest px-4 font-body-sm text-body-sm text-on-surface"
      >
        <option value="">Tous types de peau</option>
        {skinTypes.map((s) => (
          <option key={s} value={s}>
            {skinTypeLabels[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
