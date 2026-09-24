import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import { UpdateStoreSettingsInput, UpsertDeliveryZoneInput } from "../validators/settings.validator";

const SETTINGS_ID = "default";

export const settingsService = {
  /** Récupère la config boutique, la crée avec des valeurs par défaut si elle n'existe pas encore. */
  async getStoreSettings() {
    return prisma.storeSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    });
  },

  async updateStoreSettings(input: UpdateStoreSettingsInput) {
    if (
      input.minDeliveryFee !== undefined &&
      input.maxDeliveryFee !== undefined &&
      input.minDeliveryFee > input.maxDeliveryFee
    ) {
      throw ApiError.badRequest("Les frais minimum ne peuvent pas dépasser les frais maximum");
    }
    return prisma.storeSettings.upsert({
      where: { id: SETTINGS_ID },
      update: input,
      create: { id: SETTINGS_ID, ...input },
    });
  },

  async listDeliveryZones() {
    return prisma.deliveryZone.findMany({ orderBy: { fee: "asc" } });
  },

  async upsertDeliveryZone(input: UpsertDeliveryZoneInput) {
    if (input.isDefault) {
      // Une seule zone par défaut à la fois
      await prisma.deliveryZone.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }
    return prisma.deliveryZone.upsert({
      where: { name: input.name },
      update: input,
      create: input,
    });
  },

  async deleteDeliveryZone(id: string) {
    await prisma.deliveryZone.delete({ where: { id } });
  },
};
