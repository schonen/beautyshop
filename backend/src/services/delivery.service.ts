import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import { StoreSettings } from "@prisma/client";

export const deliveryService = {
  /**
   * BeautyShop ne livre que dans la ville de la boutique (règle métier absolue).
   * Comparaison insensible à la casse/espaces, jamais déléguée au frontend.
   */
  assertCityIsServed(city: string, settings: StoreSettings) {
    const normalize = (v: string) => v.trim().toLowerCase();
    if (normalize(city) !== normalize(settings.storeCity)) {
      throw ApiError.badRequest(
        `La livraison n'est disponible que dans la ville de la boutique (${settings.storeCity}).`
      );
    }
  },

  /**
   * Cherche une zone tarifaire dont le nom correspond (partiellement) au quartier saisi.
   * Sans correspondance : zone par défaut si elle existe, sinon la borne min des paramètres.
   * Le résultat est toujours borné entre minDeliveryFee et maxDeliveryFee (défense en profondeur).
   */
  async computeDeliveryFee(neighborhood: string, settings: StoreSettings): Promise<number> {
    const zones = await prisma.deliveryZone.findMany({ where: { isActive: true } });
    const normalized = neighborhood.trim().toLowerCase();

    const matched = zones.find(
      (z) => normalized.includes(z.name.toLowerCase()) || z.name.toLowerCase().includes(normalized)
    );
    const fallback = zones.find((z) => z.isDefault);
    const zone = matched ?? fallback;

    const min = Number(settings.minDeliveryFee);
    const max = Number(settings.maxDeliveryFee);
    const fee = zone ? Number(zone.fee) : min;

    return Math.min(Math.max(fee, min), max);
  },
};
