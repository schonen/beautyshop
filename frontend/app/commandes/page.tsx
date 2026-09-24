"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { api } from "@/lib/api";
import { Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/format";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Spinner } from "@/components/Alert";
import { Button } from "@/components/Button";

export default function MesCommandesPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get<{ success: boolean; items: Order[] }>("/orders/mine")
      .then((res) => setOrders(res.items))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-12">
      <h1 className="mb-6 font-headline-xl text-headline-xl text-on-surface">Mes commandes</h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-outline-variant py-16 text-center">
          <span className="material-symbols-outlined mb-2 text-[40px] text-outline">receipt_long</span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Tu n'as pas encore passé de commande.
          </p>
          <Link href="/produits" className="mt-4 inline-block">
            <Button>Découvrir le catalogue</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/commandes/${order.id}`}
              className="flex items-center justify-between rounded-2xl border border-surface-container bg-surface-container-lowest p-5 transition-shadow hover:shadow-md"
            >
              <div>
                <p className="font-mono text-sm text-on-surface-variant">#{order.id.slice(0, 8)}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{formatDate(order.createdAt)}</p>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                  {order.items.length} article(s)
                </p>
              </div>
              <div className="text-right">
                <p className="mb-2 font-price-md text-price-md text-on-surface">{formatPrice(order.total)}</p>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
