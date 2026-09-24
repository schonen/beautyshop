import { z } from "zod";

export const uuidSchema = z.string().uuid("Identifiant invalide");

/**
 * Numéros camerounais acceptés : 6XXXXXXXX (9 chiffres) ou 2376XXXXXXXX (indicatif inclus).
 * Toujours normalisé en sortie au format local 6XXXXXXXX.
 */
export const cameroonPhoneSchema = z
  .string()
  .trim()
  .regex(/^(237)?6\d{8}$/, "Numéro de téléphone camerounais invalide (format attendu : 6XXXXXXXX)")
  .transform((value) => (value.startsWith("237") ? value.slice(3) : value));

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const amountSchema = z.coerce.number().positive("Le montant doit être positif");

export const citySchema = z.string().trim().min(2).max(80);

export const addressSchema = z.string().trim().min(3).max(255);

export const transactionReferenceSchema = z.string().trim().min(5).max(100);
