"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const POLL_INTERVAL_MS = 30_000;

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    function fetchUnread() {
      api
        .get<{ success: boolean; unread: number }>("/notifications?isRead=false&limit=1")
        .then((res) => setUnread(res.unread ?? 0))
        .catch(() => undefined);
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/admin/notifications"
      className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
    >
      <span className="material-symbols-outlined text-[20px]">notifications</span>
      Notifications
      {unread > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 font-label-sm text-[11px] text-on-error">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
