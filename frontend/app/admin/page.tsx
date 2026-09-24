"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Order, Paginated, Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Spinner } from "@/components/Alert";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  successfulPayments: number;
  pendingPayments: number;
  preparingOrders: number;
  deliveries: number;
  pickups: number;
  lowStock: Product[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function load() {
      const [ordersRes, productsRes] = await Promise.all([
        api.get<{ success: boolean; items: Order[] }>("/orders?limit=100"),
        api.get<{ success: boolean } & Paginated<Product>>("/products?limit=100"),
      ]);

      const orders = ordersRes.items;
      // Le chiffre d'affaires se base sur les paiements réussis (Payment.status = SUCCESS),
      // jamais uniquement sur les commandes créées.
      const totalRevenue = orders
        .filter((o) => o.payment?.status === "SUCCESS")
        .reduce((sum, o) => sum + Number(o.total), 0);

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        successfulPayments: orders.filter((o) => o.payment?.status === "SUCCESS").length,
        pendingPayments: orders.filter((o) => o.status === "PENDING_PAYMENT").length,
        preparingOrders: orders.filter((o) => o.status === "PREPARING").length,
        deliveries: orders.filter((o) => o.fulfillmentMethod === "DELIVERY").length,
        pickups: orders.filter((o) => o.fulfillmentMethod === "PICKUP").length,
        lowStock: productsRes.items.filter((p) => p.stock > 0 && p.stock <= 5),
      });
      setRecentOrders(orders.slice(0, 5));
    }
    load();
  }, []);

  if (!stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const cards = [
    { label: "Chiffre d'affaires", value: formatPrice(stats.totalRevenue), icon: "payments" },
    { label: "Commandes", value: stats.totalOrders, icon: "receipt_long" },
    { label: "Paiements réussis", value: stats.successfulPayments, icon: "check_circle" },
    { label: "Paiements en attente", value: stats.pendingPayments, icon: "hourglass_empty" },
    { label: "En préparation", value: stats.preparingOrders, icon: "inventory_2" },
    { label: "Livraisons", value: stats.deliveries, icon: "local_shipping" },
    { label: "Retraits", value: stats.pickups, icon: "storefront" },
    { label: "Stock faible", value: stats.lowStock.length, icon: "warning" },
  ];

  return (
    <div>
      <h1 className="mb-6 font-headline-xl text-headline-xl text-on-surface">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed text-primary">
              <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{c.label}</p>
            <p className="mt-1 font-headline-lg text-headline-lg text-on-surface">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm">
          <h2 className="mb-4 font-headline-sm text-headline-sm text-on-surface">Commandes récentes</h2>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/commandes/${o.id}`}
                className="flex items-center justify-between rounded-xl border border-surface-container p-3 hover:bg-surface-container-low"
              >
                <span className="font-mono text-xs text-on-surface-variant">#{o.id.slice(0, 8)}</span>
                <span className="font-label-md text-label-md text-on-surface">{formatPrice(o.total)}</span>
                <OrderStatusBadge status={o.status} />
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <p className="font-body-sm text-body-sm text-outline">Aucune commande.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm">
          <h2 className="mb-4 font-headline-sm text-headline-sm text-on-surface">Stock faible (≤ 5)</h2>
          <div className="space-y-3">
            {stats.lowStock.map((p) => (
              <Link
                key={p.id}
                href={`/admin/produits/${p.id}`}
                className="flex items-center justify-between rounded-xl border border-surface-container p-3 hover:bg-surface-container-low"
              >
                <span className="font-label-md text-label-md text-on-surface">{p.name}</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-label-sm text-label-sm font-semibold text-amber-800">
                  {p.stock} restant(s)
                </span>
              </Link>
            ))}
            {stats.lowStock.length === 0 && (
              <p className="font-body-sm text-body-sm text-outline">Aucun produit en stock faible.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
