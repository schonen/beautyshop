"use client";

import { useEffect, useState, FormEvent } from "react";
import { api, ApiClientError } from "@/lib/api";
import { StoreSettings } from "@/types";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Alert } from "@/components/Alert";
import { Spinner } from "@/components/Alert";

export default function AdminParametresPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get<{ success: boolean; data: StoreSettings }>("/settings/store")
      .then((res) => setSettings(res.data))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await api.put<{ success: boolean; data: StoreSettings }>("/settings/store", {
        storeName: settings.storeName,
        storeCity: settings.storeCity,
        storeAddress: settings.storeAddress,
        storePhone: settings.storePhone,
        deliveryEnabled: settings.deliveryEnabled,
        minDeliveryFee: Number(settings.minDeliveryFee),
        maxDeliveryFee: Number(settings.maxDeliveryFee),
        lowStockThreshold: settings.lowStockThreshold,
      });
      setSettings(res.data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Impossible d'enregistrer les paramètres");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 font-headline-xl text-headline-xl text-on-surface">Paramètres boutique</h1>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert variant="success">Paramètres enregistrés.</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-space-md rounded-2xl border border-surface-container bg-surface-container-lowest p-6">
        <Input
          label="Nom de la boutique"
          value={settings.storeName}
          onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
          required
        />
        <Input
          label="Ville (seule ville livrée)"
          icon="location_city"
          value={settings.storeCity}
          onChange={(e) => setSettings({ ...settings, storeCity: e.target.value })}
          required
        />
        <Input
          label="Adresse"
          icon="pin_drop"
          value={settings.storeAddress}
          onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
          required
        />
        <Input
          label="Téléphone"
          icon="call"
          value={settings.storePhone}
          onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Frais min. (FCFA)"
            type="number"
            min={1000}
            max={2500}
            value={settings.minDeliveryFee}
            onChange={(e) => setSettings({ ...settings, minDeliveryFee: e.target.value })}
          />
          <Input
            label="Frais max. (FCFA)"
            type="number"
            min={1000}
            max={2500}
            value={settings.maxDeliveryFee}
            onChange={(e) => setSettings({ ...settings, maxDeliveryFee: e.target.value })}
          />
        </div>

        <Input
          label="Seuil de stock faible"
          type="number"
          min={0}
          value={settings.lowStockThreshold}
          onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
        />

        <label className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
          <input
            type="checkbox"
            checked={settings.deliveryEnabled}
            onChange={(e) => setSettings({ ...settings, deliveryEnabled: e.target.checked })}
          />
          Livraison activée
        </label>

        <Button type="submit" loading={saving} className="w-full">
          Enregistrer
        </Button>
      </form>
    </div>
  );
}
