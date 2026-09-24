import { z } from "zod";
import { cameroonPhoneSchema, citySchema, addressSchema } from "./common.validator";

const orderStatuses = [
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "PICKED_UP",
  "CANCELLED",
] as const;

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
});

const deliveryDetailsSchema = z.object({
  fulfillmentMethod: z.literal("DELIVERY"),
  customerName: z.string().trim().min(2).max(120),
  customerPhone: cameroonPhoneSchema,
  deliveryCity: citySchema,
  deliveryNeighborhood: z.string().trim().min(2).max(120),
  deliveryAddress: addressSchema,
  deliveryNotes: z.string().trim().max(300).optional(),
});

const pickupDetailsSchema = z.object({
  fulfillmentMethod: z.literal("PICKUP"),
  customerName: z.string().trim().min(2).max(120),
  customerPhone: cameroonPhoneSchema,
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "La commande doit contenir au moins un produit"),
  fulfillment: z.discriminatedUnion("fulfillmentMethod", [deliveryDetailsSchema, pickupDetailsSchema]),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatuses),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(orderStatuses).optional(),
});
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
