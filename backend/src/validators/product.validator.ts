import { z } from "zod";

const skinTypeEnum = z.enum(["NORMAL", "SEC", "GRAS", "MIXTE", "TOUS"]);

export const createProductSchema = z.object({
  brand: z.string().trim().min(2).max(80).optional(),
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10),
  price: z.coerce.number().positive("Le prix doit être positif"),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.string().url().optional(),
  skinType: skinTypeEnum.default("TOUS"),
  categoryId: z.string().uuid("categoryId invalide"),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  categoryId: z.string().uuid().optional(),
  skinType: skinTypeEnum.optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
