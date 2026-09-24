"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/Alert";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/produits", label: "Produits", icon: "inventory_2" },
  { href: "/admin/categories", label: "Catégories", icon: "category" },
  { href: "/admin/commandes", label: "Commandes", icon: "receipt_long" },
  { href: "/admin/paiements", label: "Paiements", icon: "payments" },
  { href: "/admin/parametres", label: "Paramètres", icon: "settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth("ADMIN");
  const { logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full bg-surface-container-low">
      {/* Sidebar fixe */}
          <aside className="sticky top-20 z-30 hidden h-[calc(100vh-5rem)] w-64 flex-col border-r border-surface-container bg-surface-container-lowest lg:flex">        <div className="flex flex-col gap-1 p-4">
          <p className="mb-2 px-3 font-label-sm text-label-sm font-bold uppercase tracking-wide text-outline">
            Administration
          </p>
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-label-md text-label-md transition-colors ${
                  active
                    ? "bg-secondary-fixed font-semibold text-on-secondary-fixed"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <NotificationBell />
        </div>

        <div className="mt-auto border-t border-surface-container p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="min-w-0">
              <p className="truncate font-label-md text-label-md text-on-surface">{user.name}</p>
              <p className="truncate font-body-sm text-body-sm text-on-surface-variant">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-label-md text-label-md text-error hover:bg-error-container"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Nav mobile horizontale */}
      <div className="fixed left-0 right-0 top-20 z-30 flex gap-2 overflow-x-auto border-b border-surface-container bg-surface-container-lowest px-4 py-2 lg:hidden">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 font-label-sm text-label-sm ${
                active ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      <main className="mt-14 flex-1 p-6 lg:mt-0 lg:p-10">{children}</main>
    </div>
  );
}
