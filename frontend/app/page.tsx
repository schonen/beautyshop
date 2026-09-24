import Link from "next/link";
import { api } from "@/lib/api";
import { Paginated, Product } from "@/types";
import { ProductGrid } from "@/components/ProductGrid";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await api.get<{ success: boolean } & Paginated<Product>>("/products?limit=8", {
      auth: false,
      cache: "no-store",
    });
    return res.items;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div className="flex w-full flex-col">
      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-surface-container-lowest pb-16 pt-6 sm:pt-10 lg:pb-24">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-secondary-fixed opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-1/2 h-80 w-80 rounded-full bg-secondary-container opacity-25 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-space-lg lg:grid-cols-12 lg:gap-space-xl">
            <div className="z-10 flex flex-col items-start lg:col-span-7">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary-fixed px-3 py-1 font-label-sm text-label-sm text-on-secondary-fixed shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <span>Intelligence dermo-cosmétique</span>
              </div>
              <h1 className="mb-4 max-w-xl font-headline-xl text-headline-xl tracking-tight text-on-surface">
                Prenez soin de vous,{" "}
                <span className="text-primary underline decoration-secondary-fixed-dim decoration-4 underline-offset-8">
                  simplement.
                </span>
              </h1>
              <p className="mb-8 max-w-lg font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                Découvrez des produits cosmétiques adaptés à vos besoins et profitez des conseils
                sur-mesure de notre assistant IA pour sublimer votre routine quotidienne.
              </p>
              <div className="mb-10 flex w-full flex-wrap items-center gap-space-md sm:w-auto">
                <Link
                  href="/produits"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-label-md text-label-md text-on-primary shadow-[0_4px_16px_-4px_rgba(173,45,71,0.35)] transition-all hover:opacity-95 active:scale-[0.98] sm:w-auto"
                >
                  <span>Découvrir les produits</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <Link
                  href="/assistant"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-surface-bright px-8 py-3.5 font-label-md text-label-md text-primary shadow-sm transition-all hover:bg-secondary-fixed sm:w-auto"
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    psychology
                  </span>
                  <span>Demander conseil à l'IA</span>
                </Link>
              </div>
            </div>

            {/* Visuel hero */}
            <div className="relative mt-6 lg:col-span-5 lg:mt-0">
              <div className="relative overflow-hidden rounded-3xl bg-surface-bright p-3 shadow-xl">
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-secondary-fixed to-primary-fixed">
                  <span className="material-symbols-outlined text-[120px] text-on-primary-fixed opacity-60">
                    spa
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3.5 rounded-2xl bg-surface-container-lowest/95 p-4 shadow-lg backdrop-blur-md">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-primary">
                    <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate font-label-md text-label-md font-semibold text-on-surface">
                        Assistant BeautyShop
                      </p>
                      <span className="font-label-sm text-label-sm font-semibold text-primary">En ligne</span>
                    </div>
                    <p className="truncate font-body-sm text-body-sm text-on-surface-variant">
                      Recommandations à partir de notre catalogue réel
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="w-full bg-surface-container-low py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-space-md md:grid-cols-3 lg:gap-space-lg">
            <div className="flex items-center gap-space-md rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-primary">
                <span className="material-symbols-outlined text-[24px]">local_shipping</span>
              </div>
              <div>
                <h2 className="font-label-md text-label-md font-semibold text-on-surface">
                  Paiement à la livraison
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Recevez et vérifiez avant de payer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-md rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-primary">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <div>
                <h2 className="font-label-md text-label-md font-semibold text-on-surface">
                  Produits certifiés
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Sélection dermo-cosmétique de qualité
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-md rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-primary">
                <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
              </div>
              <div>
                <h2 className="font-label-md text-label-md font-semibold text-on-surface">
                  Conseils par IA
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Recommandations sur-mesure et gratuites
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUITS */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Nos derniers produits</h2>
          <Link href="/produits" className="font-label-md text-label-md text-primary hover:underline">
            Voir tout →
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>

      {/* CTA ASSISTANT IA */}
      <section className="relative w-full py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="rounded-3xl bg-gradient-to-br from-surface-container-lowest via-secondary-fixed/30 to-surface-container p-8 shadow-lg lg:p-14">
            <div className="grid grid-cols-1 items-center gap-space-lg lg:grid-cols-12 lg:gap-space-xl">
              <div className="space-y-space-md lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1 font-label-sm text-label-sm font-semibold text-on-secondary-container shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    bolt
                  </span>
                  <span>Réponse instantanée & personnalisée</span>
                </div>
                <h2 className="font-headline-xl text-headline-xl tracking-tight text-on-surface">
                  Besoin d'aide pour choisir ?
                </h2>
                <p className="max-w-xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                  Notre assistant analyse votre type de peau et votre budget pour vous recommander
                  les soins parfaits, disponibles immédiatement dans notre catalogue.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link
                    href="/assistant"
                    className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-8 py-4 font-label-md text-label-md font-semibold text-on-primary shadow-[0_4px_20px_-4px_rgba(173,45,71,0.4)] transition-all hover:opacity-95 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      smart_toy
                    </span>
                    <span>Parler à l'assistant IA</span>
                  </Link>
                  <span className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">verified_user</span>
                    100% gratuit & sans engagement
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="space-y-4 rounded-2xl bg-surface-container-lowest p-6 shadow-md">
                  <div className="flex items-center justify-between border-b border-surface-container pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed text-primary">
                        <span className="material-symbols-outlined text-[22px]">psychology</span>
                      </div>
                      <div>
                        <h3 className="font-label-md text-label-md font-semibold text-on-surface">
                          Assistant BeautyShop
                        </h3>
                        <p className="font-body-sm text-body-sm font-medium text-emerald-600">En ligne</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-on-surface p-3.5 font-body-sm text-body-sm text-surface-bright shadow-sm">
                      Bonjour ! J'ai la peau sèche, que me conseillez-vous à moins de 10 000 FCFA ?
                    </div>
                  </div>

                  <div className="flex items-start justify-start gap-2.5">
                    <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[14px] text-on-primary">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    </div>
                    <div className="max-w-[88%] space-y-2 rounded-2xl rounded-tl-sm bg-surface-container-low p-3.5 font-body-sm text-body-sm text-on-surface shadow-sm">
                      <p>Voici 2 produits de notre catalogue adaptés à votre budget :</p>
                      <div className="flex items-center gap-2 rounded-xl bg-surface-container-lowest p-2.5 shadow-sm">
                        <span className="material-symbols-outlined text-[20px] text-primary">check_circle</span>
                        <span className="font-label-sm text-label-sm font-medium text-on-surface">
                          Crème Hydratante X — 7 500 FCFA
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-surface-container-lowest p-2.5 shadow-sm">
                        <span className="material-symbols-outlined text-[20px] text-primary">check_circle</span>
                        <span className="font-label-sm text-label-sm font-medium text-on-surface">
                          Crème Nourrissante Y — 8 500 FCFA
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/assistant"
                    className="flex w-full items-center justify-between rounded-xl bg-surface-container px-4 py-2.5 font-label-sm text-label-sm font-semibold text-on-surface transition-colors hover:bg-secondary-fixed"
                  >
                    <span>Poser ma question maintenant...</span>
                    <span className="material-symbols-outlined text-[18px] text-primary">send</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
