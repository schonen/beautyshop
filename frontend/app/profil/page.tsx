"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatDate } from "@/lib/format";
import { Spinner } from "@/components/Alert";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function ProfilPage() {
  const { user, loading } = useRequireAuth();

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-10 lg:px-12">
      <h1 className="mb-6 font-headline-xl text-headline-xl text-on-surface">Mon profil</h1>

      <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary font-headline-lg text-headline-lg text-on-primary shadow-md">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <dl className="space-y-4">
          <div>
            <dt className="flex items-center gap-1.5 font-label-sm text-label-sm text-outline">
              <span className="material-symbols-outlined text-[16px]">person</span>
              Nom
            </dt>
            <dd className="mt-0.5 font-body-md text-body-md font-medium text-on-surface">{user.name}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 font-label-sm text-label-sm text-outline">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              Email
            </dt>
            <dd className="mt-0.5 font-body-md text-body-md font-medium text-on-surface">{user.email}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 font-label-sm text-label-sm text-outline">
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              Membre depuis
            </dt>
            <dd className="mt-0.5 font-body-md text-body-md font-medium text-on-surface">
              {formatDate(user.createdAt)}
            </dd>
          </div>
        </dl>
      </div>

      <Link href="/commandes" className="mt-6 block">
        <Button variant="outline" className="w-full gap-2">
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          Voir mes commandes
        </Button>
      </Link>
    </div>
  );
}
