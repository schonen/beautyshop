"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest py-space-xl shadow-[0_-1px_8px_rgba(255,107,129,0.04)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-space-xl pb-space-lg md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-space-sm">
            <div className="flex items-center gap-space-sm">
              <Image src="/logo.png" alt="BeautyShop Logo" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Beauty<span className="text-primary">Shop</span>
              </span>
            </div>
            <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
              Des produits cosmétiques choisis avec soin, conseillés par un assistant intelligent pour
              sublimer votre routine au quotidien.
            </p>
          </div>

          <div className="space-y-space-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Navigation</h3>
            <ul className="space-y-space-xs">
              <li>
                <Link href="/produits" className="font-body-md text-body-md text-on-surface-variant hover:text-primary">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="font-body-md text-body-md text-on-surface-variant hover:text-primary">
                  Conseils IA
                </Link>
              </li>
              <li>
                <Link href="/commandes" className="font-body-md text-body-md text-on-surface-variant hover:text-primary">
                  Suivi commande
                </Link>
              </li>
              <li>
                <Link href="/panier" className="font-body-md text-body-md text-on-surface-variant hover:text-primary">
                  Mon panier
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-space-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Contact</h3>
            <ul className="space-y-space-xs">
              <li className="flex items-center gap-space-xs font-body-md text-body-md text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-primary">call</span>
                <span>+237 690 00 00 00</span>
              </li>
              <li className="flex items-center gap-space-xs font-body-md text-body-md text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-primary">mail</span>
                <span>contact@beautyshop.com</span>
              </li>
            </ul>
          </div>

          <div className="space-y-space-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Communauté</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Rejoignez notre cercle beauté et recevez nos conseils dermo-cosmétiques.
            </p>
            <div className="flex items-center gap-space-sm pt-space-xs">
              <a
                aria-label="WhatsApp"
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-emerald-600 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </a>
              <a
                aria-label="Instagram"
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-primary hover:text-on-primary"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </a>
              <a
                aria-label="Facebook"
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-primary hover:text-on-primary"
              >
                <span className="material-symbols-outlined text-[18px]">public</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-md border-t border-surface-container pt-space-lg sm:flex-row">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © {new Date().getFullYear()} BeautyShop. Tous droits réservés.
          </p>
          <div className="flex items-center gap-space-md">
            <Link href="/profil" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary">
              Confidentialité
            </Link>
            <Link href="/produits" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary">
              Conditions de vente
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
