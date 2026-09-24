"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate, orderStatusLabels, fulfillmentMethodLabels } from "@/lib/format";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Spinner } from "@/components/Alert";

const statuses: (OrderStatus | "ALL")[] = [
  "ALL",
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "PICKED_UP",
  "CANCELLED",
];

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

  useEffect(() => {
    api
      .get<{ success: boolean; items: Order[] }>("/orders?limit=100")
      .then((res) => setOrders(res.items))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="mb-6 font-headline-xl text-headline-xl text-on-surface">Commandes</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 font-label-sm text-label-sm ${
              filter === s
                ? "bg-primary text-on-primary"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {s === "ALL" ? "Toutes" : orderStatusLabels[s]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-container bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full font-body-sm text-body-sm">
            <thead className="border-b border-surface-container bg-surface-container-low text-left text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-label-sm text-label-sm">Commande</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Client</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Date</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Total</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Mode</th>
                <th className="px-4 py-3 font-label-sm text-label-sm">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3">
                    <Link href={`/admin/commandes/${o.id}`} className="font-mono text-primary hover:underline">
                      #{o.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{o.user?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{fulfillmentMethodLabels[o.fulfillmentMethod]}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-8 text-center font-body-md text-body-md text-outline">Aucune commande.</p>
        )}
      </div>
    </div>
  );
}
