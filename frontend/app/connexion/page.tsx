"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, ApiClientError } from "@/lib/auth-context";
import { Alert } from "@/components/Alert";

export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <ConnexionForm />
    </Suspense>
  );
}

function ConnexionForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push(searchParams.get("next") ?? "/");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Impossible de se connecter");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center bg-surface p-space-md">
      <div className="flex w-full flex-col items-center justify-center p-space-sm md:p-space-lg">
        <div className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-surface-container bg-surface-container-lowest shadow-xl lg:grid-cols-12">
          {/* Panneau gauche : formulaire */}
          <div className="relative z-10 flex flex-col justify-between bg-surface-container-lowest p-space-md sm:p-space-lg md:p-space-xl lg:col-span-7">
            <div className="mx-auto flex w-full max-w-md flex-col items-center">
              <Link href="/" className="group mb-space-md flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-fixed p-space-xs shadow-sm transition-transform duration-300 group-hover:scale-105">
                  <Image src="/logo.png" alt="BeautyShop" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                </div>
                <span className="mt-space-xs font-headline-sm tracking-tight text-primary">BeautyShop</span>
              </Link>

              <div className="mb-space-lg w-full text-center">
                <h1 className="mb-space-xs font-headline-lg tracking-tight text-on-surface">Bienvenue !</h1>
                <p className="mx-auto max-w-xs font-body-md text-on-surface-variant">
                  Connectez-vous pour retrouver vos commandes et conseils personnalisés.
                </p>
              </div>

              <form className="flex w-full flex-col gap-space-md" onSubmit={handleSubmit}>
                {error && <Alert>{error}</Alert>}

                <div className="flex flex-col gap-space-xs text-left">
                  <label className="flex items-center gap-space-xs font-label-md text-on-surface" htmlFor="email">
                    <span className="material-symbols-outlined text-body-md text-primary">mail</span>
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="ex: sarah@exemple.com"
                    className="h-12 w-full rounded-xl border border-surface-container bg-surface px-space-md font-body-md text-on-surface outline-none transition-all duration-200 placeholder:text-outline focus:bg-surface-container-low"
                  />
                </div>

                <div className="flex flex-col gap-space-xs text-left">
                  <label className="flex items-center gap-space-xs font-label-md text-on-surface" htmlFor="password">
                    <span className="material-symbols-outlined text-body-md text-primary">lock</span>
                    Mot de passe
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Votre mot de passe"
                      className="h-12 w-full rounded-xl border border-surface-container bg-surface pl-space-md pr-12 font-body-md text-on-surface outline-none transition-all duration-200 placeholder:text-outline focus:bg-surface-container-low"
                    />
                    <button
                      type="button"
                      aria-label="Afficher ou masquer le mot de passe"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-space-sm p-space-xs text-outline transition-colors hover:text-primary"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-space-xs flex h-12 w-full items-center justify-center gap-space-xs rounded-full bg-primary font-headline-sm text-on-primary shadow-md transition-all duration-300 hover:opacity-95 disabled:opacity-60"
                >
                  <span>{loading ? "Connexion..." : "Se connecter"}</span>
                  {!loading && (
                    <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  )}
                </button>
              </form>

              <p className="mt-space-lg text-center font-body-sm text-on-surface-variant">
                Pas encore de compte ?{" "}
                <Link href="/inscription" className="ml-1 font-label-md font-semibold text-primary hover:text-on-primary-container">
                  Créer un compte
                </Link>
              </p>
            </div>

            <div className="mt-space-lg flex items-center justify-center gap-space-xs border-t border-surface-container pt-space-md text-center text-tertiary">
              <span className="material-symbols-outlined text-body-sm text-primary">verified_user</span>
              <span className="font-label-sm">Connexion sécurisée — Vos données restent protégées</span>
            </div>
          </div>

          {/* Panneau droit : illustration */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-secondary-fixed via-surface-container to-primary-fixed p-space-lg text-on-surface lg:col-span-5 lg:flex md:p-space-xl">
            <div className="relative z-10 flex justify-end">
              <div className="inline-flex items-center gap-space-xs rounded-full bg-surface-container-lowest/90 px-space-md py-space-xs shadow-sm backdrop-blur">
                <span className="material-symbols-outlined text-body-md text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <span className="font-label-sm font-bold uppercase tracking-wider text-on-surface">Beauty Intelligence</span>
              </div>
            </div>

            <div className="relative z-10 my-auto flex max-w-sm flex-col items-start">
              <div className="mb-space-md flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-on-primary shadow-md">
                <span className="material-symbols-outlined text-headline-md">spa</span>
              </div>
              <p className="mb-space-sm font-headline-lg leading-tight tracking-tight text-on-surface">
                « L'intelligence artificielle au service de l'éclat de votre peau au quotidien. »
              </p>
              <div className="mb-space-md h-1 w-12 rounded-full bg-primary-container" />
              <p className="font-body-md text-on-surface-variant">
                Des recommandations sur-mesure, issues directement de notre catalogue produits.
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-space-md">
              <span className="font-label-sm text-tertiary">BeautyShop © {new Date().getFullYear()}</span>
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary-container" />
                <div className="h-2 w-2 rounded-full bg-secondary-fixed-dim" />
                <div className="h-2 w-2 rounded-full bg-surface-container-highest" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
