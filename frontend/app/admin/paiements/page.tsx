"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Order, PaymentMethod } from "@/types";
import { formatPrice, formatDate, paymentMethodLabels, paymentStatusLabels } from "@/lib/format";
import { Spinner } from "@/components/Alert";

type Filter = "ALL" | PaymentMethod | "SUCCESS" | "FAILED";

const filters: { key: Filter; label: string }[] = [
  { key: "ALL", label: "Tous" },
  { key: "ORANGE_MONEY", label: "Orange Money" },
  { key: "MTN_MOBILE_MONEY", label: "MTN Mobile Money" },
  { key: "CARD", label: "Carte" },
  { key: "SUCCESS", label: "Réussis" },
  { key: "FAILED", label: "Échoués" },
];

export default function AdminPaiementsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");

  useEffect(() => {
    api
      .get<{ success: boolean; items: Order[] }>("/orders?limit=100")
      .then((res) => setOrders(res.items.filter((o) => o.payment)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const filtered = orders.filter((o) => {
    if (filter === "ALL") return true;
    if (filter === "SUCCESS" || filter === "FAILED") return o.payment?.status === filter;
    return o.payment?.method === filter;
  });

  return (
    <div>
      <h1 className="mb-6 font-headline-xl text-headline-xl text-on-surface">Paiements</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 font-label-sm text-label-sm ${
              filter === f.key
                ? "bg-primary text-on-primary"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-container bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full font-body-sm text-body-sm">
            <thead className="border-b border-surface-container bg-surface-container-low text-left text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-label-sm text-label-sm">Référence</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Commande</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Client</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Téléphone</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Méthode</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Montant</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Statut</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filtered.map((o) => (
                <tr key={o.payment!.id} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3 font-mono text-xs text-on-surface">{o.payment!.transactionReference}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/commandes/${o.id}`} className="font-mono text-primary hover:underline">
                      #{o.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{o.customerName}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{o.customerPhone}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{paymentMethodLabels[o.payment!.method]}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{formatPrice(o.payment!.amount)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        o.payment!.status === "SUCCESS"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {paymentStatusLabels[o.payment!.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{formatDate(o.payment!.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-8 text-center font-body-md text-body-md text-outline">Aucun paiement.</p>
        )}
      </div>
    </div>
  );
}
