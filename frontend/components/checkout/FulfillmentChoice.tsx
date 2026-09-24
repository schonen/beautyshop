"use client";

import { FulfillmentInput, StoreSettings } from "@/types";
import { Input } from "@/components/Input";

interface Props {
  value: FulfillmentInput;
  onChange: (value: FulfillmentInput) => void;
  storeSettings: StoreSettings | null;
}

const DELIVERY_DEFAULTS = { deliveryCity: "", deliveryNeighborhood: "", deliveryAddress: "", deliveryNotes: "" };

export function FulfillmentChoice({ value, onChange, storeSettings }: Props) {
  function setMethod(method: "DELIVERY" | "PICKUP") {
    if (method === "PICKUP") {
      onChange({ fulfillmentMethod: "PICKUP", customerName: value.customerName, customerPhone: value.customerPhone });
    } else {
      onChange({
        fulfillmentMethod: "DELIVERY",
        customerName: value.customerName,
        customerPhone: value.customerPhone,
        ...DELIVERY_DEFAULTS,
      });
    }
  }

  return (
    <div className="space-y-space-md">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMethod("DELIVERY")}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
            value.fulfillmentMethod === "DELIVERY"
              ? "border-primary bg-primary-container/30"
              : "border-surface-container hover:bg-surface-container-low"
          }`}
        >
          <span className="material-symbols-outlined text-primary">local_shipping</span>
          <div>
            <p className="font-label-md text-label-md text-on-surface">Livraison à domicile</p>
            {storeSettings && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Uniquement à {storeSettings.storeCity}
              </p>
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMethod("PICKUP")}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
            value.fulfillmentMethod === "PICKUP"
              ? "border-primary bg-primary-container/30"
              : "border-surface-container hover:bg-surface-container-low"
          }`}
        >
          <span className="material-symbols-outlined text-primary">storefront</span>
          <div>
            <p className="font-label-md text-label-md text-on-surface">Retrait en boutique</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Frais de livraison : 0 FCFA</p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Nom complet"
          icon="person"
          value={value.customerName}
          onChange={(e) => onChange({ ...value, customerName: e.target.value })}
          required
        />
        <Input
          label="Téléphone (ex: 677889900)"
          icon="call"
          value={value.customerPhone}
          onChange={(e) => onChange({ ...value, customerPhone: e.target.value })}
          required
        />
      </div>

      {value.fulfillmentMethod === "DELIVERY" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Ville"
            icon="location_city"
            value={value.deliveryCity}
            onChange={(e) => onChange({ ...value, deliveryCity: e.target.value })}
            placeholder={storeSettings?.storeCity ?? "Douala"}
            required
          />
          <Input
            label="Quartier"
            icon="map"
            value={value.deliveryNeighborhood}
            onChange={(e) => onChange({ ...value, deliveryNeighborhood: e.target.value })}
            required
          />
          <div className="sm:col-span-2">
            <Input
              label="Adresse précise"
              icon="pin_drop"
              value={value.deliveryAddress}
              onChange={(e) => onChange({ ...value, deliveryAddress: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Indications complémentaires (optionnel)"
              icon="notes"
              value={value.deliveryNotes ?? ""}
              onChange={(e) => onChange({ ...value, deliveryNotes: e.target.value })}
            />
          </div>
        </div>
      ) : (
        storeSettings && (
          <div className="rounded-2xl border border-surface-container bg-surface-container-low p-4">
            <p className="font-label-md text-label-md text-on-surface">{storeSettings.storeName}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{storeSettings.storeAddress}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{storeSettings.storeCity}</p>
          </div>
        )
      )}
    </div>
  );
}
