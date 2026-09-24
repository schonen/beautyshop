"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Notification } from "@/types";
import { formatDate } from "@/lib/format";
import { Spinner } from "@/components/Alert";
import { Button } from "@/components/Button";

const TYPE_ICONS: Record<string, string> = {
  PAYMENT_SUCCESS: "payments",
  NEW_ORDER: "shopping_bag",
  ORDER_STATUS_CHANGED: "sync_alt",
  LOW_STOCK: "warning",
  SYSTEM: "info",
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    api
      .get<{ success: boolean; items: Notification[] }>("/notifications?limit=50")
      .then((res) => setNotifications(res.items))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function markRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
    load();
  }

  async function markAllRead() {
    await api.patch("/notifications/read-all");
    load();
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-headline-xl text-headline-xl text-on-surface">Notifications</h1>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          Tout marquer comme lu
        </Button>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 ${
              n.isRead ? "border-surface-container bg-surface-container-lowest" : "border-primary/30 bg-primary-container/20"
            }`}
          >
            <span className="material-symbols-outlined text-primary">{TYPE_ICONS[n.type] ?? "notifications"}</span>
            <div className="flex-1">
              <p className="font-label-md text-label-md text-on-surface">{n.title}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{n.message}</p>
              <p className="mt-1 font-body-sm text-body-sm text-outline">{formatDate(n.createdAt)}</p>
            </div>
            {!n.isRead && (
              <button
                onClick={() => markRead(n.id)}
                className="font-label-sm text-label-sm text-primary hover:underline"
              >
                Marquer comme lu
              </button>
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="p-8 text-center font-body-md text-body-md text-outline">Aucune notification.</p>
        )}
      </div>
    </div>
  );
}
