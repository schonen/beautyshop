"use client";

import { useEffect, useState, FormEvent } from "react";
import { api, ApiClientError } from "@/lib/api";
import { Category } from "@/types";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Alert, Spinner } from "@/components/Alert";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .get<{ success: boolean; data: Category[] }>("/categories")
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description ?? "" });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ name: "", description: "" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
      } else {
        await api.post("/categories", form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Opération impossible");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette catégorie ? (impossible si elle contient des produits)")) return;
    setError(null);
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Suppression impossible");
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-headline-xl text-headline-xl text-on-surface">Catégories</h1>

      <div className="grid gap-space-lg lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="space-y-space-sm rounded-2xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm"
        >
          <h2 className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
            <span className="material-symbols-outlined text-primary">
              {editingId ? "edit" : "add_circle"}
            </span>
            {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </h2>
          {error && <Alert>{error}</Alert>}
          <Input
            label="Nom"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Description (optionnel)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={submitting} size="sm">
              {editingId ? "Enregistrer" : "Ajouter"}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                Annuler
              </Button>
            )}
          </div>
        </form>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="divide-y divide-surface-container rounded-2xl border border-surface-container bg-surface-container-lowest shadow-sm">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-primary">
                      <span className="material-symbols-outlined text-[18px]">category</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{c.name}</p>
                      {c.description && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{c.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 font-body-sm text-body-sm">
                    <button onClick={() => startEdit(c)} className="text-primary hover:underline">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-error hover:underline">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="p-8 text-center font-body-md text-body-md text-outline">Aucune catégorie.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
