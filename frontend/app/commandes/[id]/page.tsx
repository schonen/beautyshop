"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { api } from "@/lib/api";
import { Order } from "@/types";
import { formatPrice, formatDate, paymentMethodLabels, paymentStatusLabels, fulfillmentMethodLabels } from "@/lib/format";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Spinner } from "@/components/Alert";
import { Button } from "@/components/Button";

export default function OrderDetailPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const params = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get<{ success: boolean; data: Order }>(`/orders/${params.id}`)
      .then((res) => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [user, params.id]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!order) {
    return (
      <p className="mx-auto max-w-2xl px-6 py-20 text-center font-body-md text-on-surface-variant">
        Commande introuvable.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 lg:px-12">
      <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Commande</p>
            <p className="font-mono text-sm text-on-surface">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <p className="mb-4 font-body-sm text-body-sm text-on-surface-variant">
          Passée le {formatDate(order.createdAt)}
        </p>

        <div className="divide-y divide-surface-container border-y border-surface-container">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 font-body-md text-body-md">
              <span className="text-on-surface-variant">
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-medium text-on-surface">
                {formatPrice(Number(item.unitPrice) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>Livraison</span>
            <span>{Number(order.deliveryFee) === 0 ? "Gratuit" : formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-price-lg text-price-lg text-on-surface">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-surface-container pt-4 sm:grid-cols-2">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Mode de réception</p>
            <p className="font-body-md text-body-md text-on-surface">{fulfillmentMethodLabels[order.fulfillmentMethod]}</p>
            {order.fulfillmentMethod === "DELIVERY" && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {order.deliveryAddress}, {order.deliveryNeighborhood}, {order.deliveryCity}
              </p>
            )}
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Contact</p>
            <p className="font-body-md text-body-md text-on-surface">{order.customerName}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{order.customerPhone}</p>
          </div>
        </div>

        {order.payment && (
          <div className="mt-6 rounded-xl bg-surface-container-low p-4">
            <p className="mb-2 font-label-sm text-label-sm text-on-surface-variant">Paiement</p>
            <div className="grid grid-cols-2 gap-y-1 font-body-sm text-body-sm">
              <span className="text-on-surface-variant">Méthode</span>
              <span className="text-right text-on-surface">{paymentMethodLabels[order.payment.method]}</span>
              <span className="text-on-surface-variant">Statut</span>
              <span className="text-right text-on-surface">
                {order.payment.status === "SUCCESS" ? "✓ " : ""}
                {paymentStatusLabels[order.payment.status]}
              </span>
              <span className="text-on-surface-variant">Référence</span>
              <span className="text-right font-mono text-on-surface">{order.payment.transactionReference}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <Link href="/commandes">
          <Button variant="outline">Mes commandes</Button>
        </Link>
        <Link href="/produits">
          <Button variant="ghost">Continuer mes achats</Button>
        </Link>
      </div>
    </div>
  );
}
