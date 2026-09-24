import { z } from "zod";
import { cameroonPhoneSchema } from "./common.validator";

const mobileMoneyPaymentSchema = z.object({
  method: z.enum(["ORANGE_MONEY", "MTN_MOBILE_MONEY"]),
  phone: cameroonPhoneSchema,
});

// Numéro de carte : chiffres uniquement (espaces tolérés en saisie), jamais stocké tel quel.
const cardPaymentSchema = z.object({
  method: z.literal("CARD"),
  cardNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s+/g, ""))
    .pipe(z.string().regex(/^\d{13,19}$/, "Numéro de carte invalide")),
  expiryMonth: z.coerce.number().int().min(1).max(12),
  expiryYear: z.coerce.number().int().min(new Date().getFullYear()),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV invalide"),
  cardHolder: z.string().trim().min(2).max(120),
});

export const simulatePaymentSchema = z.discriminatedUnion("method", [
  mobileMoneyPaymentSchema,
  cardPaymentSchema,
]);
export type SimulatePaymentInput = z.infer<typeof simulatePaymentSchema>;

// Idempotence : le client génère une clé côté frontend (ex: uuid) et la renvoie
// à l'identique s'il rejoue la requête (double clic, retry réseau...).
export const idempotencyKeySchema = z.string().trim().min(8).max(100).optional();
