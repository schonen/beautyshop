"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Produits", href: "/produits" },
  { label: "Assistant IA", href: "/assistant" },
  { label: "Mes commandes", href: "/commandes" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(search.trim() ? `/produits?search=${encodeURIComponent(search.trim())}` : "/produits");
  }

  return (
    <header className="fixed top-0 z-50 w-full bg-surface-container-lowest/90 shadow-[0_1px_8px_rgba(255,107,129,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-space-md px-6 lg:px-12">
        <Link href="/" className="group flex items-center gap-space-sm">
          <Image
            src="/logo.png"
            alt="BeautyShop Logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover transition-transform group-hover:scale-105"
          />
          <span className="hidden font-headline-sm text-headline-sm tracking-tight text-on-surface sm:inline-block">
            Beauty<span className="text-primary">Shop</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-space-sm lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-space-md py-space-xs font-label-md text-label-md transition-all ${
                  active
                    ? "bg-secondary-fixed font-semibold text-on-secondary-fixed"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-space-sm">
          <form onSubmit={handleSearch} className="relative hidden w-48 md:block xl:w-64">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un soin..."
              className="w-full rounded-full bg-surface-container-low py-space-xs pl-9 pr-space-md font-body-sm text-body-sm text-on-surface placeholder:text-outline transition-all focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary-container"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
              search
            </span>
          </form>

          <button
            aria-label="Recherche"
            onClick={() => router.push("/produits")}
            className="rounded-full p-space-xs text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface md:hidden"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>

          <Link
            href="/panier"
            aria-label="Panier"
            className="relative rounded-full p-space-xs text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
            {count > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/profil"
                aria-label="Profil"
                className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-surface-container"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <span className="hidden text-xs font-semibold text-on-surface xl:inline">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 font-label-sm text-label-sm text-primary hover:bg-primary hover:text-on-primary sm:inline-flex"
                >
                  <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                aria-label="Déconnexion"
                className="hidden rounded-full p-space-xs text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-error sm:inline-flex"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/connexion"
              className="hidden items-center justify-center rounded-full bg-primary px-space-md py-space-xs font-label-md text-label-md text-on-primary shadow-[0_2px_8px_-2px_rgba(255,107,129,0.2)] hover:opacity-95 sm:inline-flex"
            >
              Connexion
            </Link>
          )}

          <button
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-full p-space-xs text-on-surface-variant hover:bg-surface-container-high lg:hidden"
          >
            <span className="material-symbols-outlined text-[24px]">{mobileOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="space-y-3 border-t border-surface-container-high bg-surface-container-lowest px-6 py-4 shadow-lg lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block w-full rounded-xl px-4 py-2.5 font-label-md text-label-md transition-colors ${
                pathname === item.href
                  ? "bg-secondary-fixed font-semibold text-on-secondary-fixed"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 border-t border-surface-container-high pt-2">
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-between rounded-xl bg-primary-fixed/40 px-4 py-2.5 font-label-md text-label-md text-primary"
              >
                <span>Espace Administrateur</span>
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              </Link>
            )}
            {!user ? (
              <Link
                href="/connexion"
                onClick={() => setMobileOpen(false)}
                className="w-full rounded-full bg-primary py-2.5 text-center font-label-md text-label-md text-on-primary"
              >
                Connexion
              </Link>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  router.push("/");
                }}
                className="w-full rounded-full bg-surface-container-low py-2.5 text-center font-label-md text-label-md text-on-surface"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
