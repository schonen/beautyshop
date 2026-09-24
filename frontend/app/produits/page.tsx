import { api } from "@/lib/api";
import { Paginated, Product } from "@/types";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductFilters } from "@/components/ProductFilters";
import Link from "next/link";

interface PageProps {
  searchParams: { [key: string]: string | undefined };
}

async function getProducts(searchParams: PageProps["searchParams"]) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  try {
    return await api.get<{ success: boolean } & Paginated<Product>>(
      `/products?${params.toString()}`,
      { auth: false, cache: "no-store" }
    );
  } catch {
    return { items: [] as Product[], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
  }
}

export default async function ProduitsPage({ searchParams }: PageProps) {
  const { items, pagination } = await getProducts(searchParams);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
      <h1 className="mb-6 font-headline-xl text-headline-xl text-on-surface">Catalogue</h1>

      <ProductFilters />

      <p className="mb-4 font-body-sm text-body-sm text-on-surface-variant">
        {pagination.total} produit(s) trouvé(s)
      </p>

      <ProductGrid products={items} />

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams(searchParams as Record<string, string>);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/produits?${params.toString()}`}
                className={`rounded-full px-3.5 py-1.5 font-label-md text-label-md ${
                  p === pagination.page
                    ? "bg-primary text-on-primary"
                    : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
