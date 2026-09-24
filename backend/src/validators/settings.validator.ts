import { z } from "zod";
import { citySchema, addressSchema, cameroonPhoneSchema } from "./common.validator";

export const updateStoreSettingsSchema = z.object({
  storeName: z.string().trim().min(2).max(100).optional(),
  storeCity: citySchema.optional(),
  storeAddress: addressSchema.optional(),
  storePhone: cameroonPhoneSchema.optional(),
  deliveryEnabled: z.boolean().optional(),
  minDeliveryFee: z.coerce.number().nonnegative().optional(),
  maxDeliveryFee: z.coerce.number().positive().optional(),
  lowStockThreshold: z.coerce.number().int().nonnegative().optional(),
});
export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;

export const upsertDeliveryZoneSchema = z.object({
  name: z.string().trim().min(2).max(80),
  fee: z.coerce.number().min(1000).max(2500, "Les frais doivent rester entre 1 000 et 2 500 FCFA"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export type UpsertDeliveryZoneInput = z.infer<typeof upsertDeliveryZoneSchema>;
