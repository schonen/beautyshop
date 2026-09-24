"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, ApiClientError } from "@/lib/api";
import { Order, OrderStatus } from "@/types";
import {
  formatPrice,
  formatDate,
  orderStatusLabels,
  paymentMethodLabels,
  paymentStatusLabels,
  fulfillmentMethodLabels,
} from "@/lib/format";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Spinner, Alert } from "@/components/Alert";
import { Button } from "@/components/Button";

// Miroir côté frontend de la machine à états du backend (order.service.ts) : n'affiche
// que les transitions réellement autorisées, le backend restant la seule source de vérité.
const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["CANCELLED"],
  PAID: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_PICKUP: ["PICKED_UP", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  PICKED_UP: [],
  CANCELLED: [],
};

export default function AdminCommandeDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api
      .get<{ success: boolean; data: Order }>(`/orders/${params.id}`)
      .then((res) => setOrder(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [params.id]);

  async function handleStatusChange(status: OrderStatus) {
    setError(null);
    setUpdating(true);
    try {
      await api.patch(`/orders/${params.id}/status`, { status });
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Impossible de changer le statut");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!order) return <p className="font-body-md text-body-md text-outline">Commande introuvable.</p>;

  const nextStatuses = NEXT_STATUSES[order.status];

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">
            Commande #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
            <span className="material-symbols-outlined text-primary">person</span>
            Client
          </h2>
          <p className="font-body-md text-body-md text-on-surface">{order.customerName}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{order.customerPhone}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{order.user?.email}</p>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
            <span className="material-symbols-outlined text-primary">
              {order.fulfillmentMethod === "DELIVERY" ? "local_shipping" : "storefront"}
            </span>
            {fulfillmentMethodLabels[order.fulfillmentMethod]}
          </h2>
          {order.fulfillmentMethod === "DELIVERY" ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {order.deliveryAddress}, {order.deliveryNeighborhood}, {order.deliveryCity}
              {order.deliveryNotes && <><br />{order.deliveryNotes}</>}
            </p>
          ) : (
            <p className="font-body-sm text-body-sm text-on-surface-variant">Retrait en boutique</p>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
          <span className="material-symbols-outlined text-primary">shopping_bag</span>
          Articles
        </h2>
        <div className="divide-y divide-surface-container">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 font-body-md text-body-md">
              <span className="text-on-surface-variant">
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-medium text-on-surface">
                {formatPrice(Number(item.unitPrice) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t border-surface-container pt-3">
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
      </div>

      {order.payment && (
        <div className="mb-6 rounded-2xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
            <span className="material-symbols-outlined text-primary">payments</span>
            Paiement
          </h2>
          <div className="grid grid-cols-2 gap-y-1 font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Méthode</span>
            <span className="text-right text-on-surface">{paymentMethodLabels[order.payment.method]}</span>
            <span className="text-on-surface-variant">Statut</span>
            <span className="text-right text-on-surface">{paymentStatusLabels[order.payment.status]}</span>
            <span className="text-on-surface-variant">Référence</span>
            <span className="text-right font-mono text-on-surface">{order.payment.transactionReference}</span>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
          <span className="material-symbols-outlined text-primary">sync_alt</span>
          Changer le statut
        </h2>
        {nextStatuses.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Statut final — aucune transition possible.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <Button key={s} size="sm" variant="outline" disabled={updating} onClick={() => handleStatusChange(s)}>
                {orderStatusLabels[s]}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
