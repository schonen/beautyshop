import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
} from "../validators/product.validator";

export const productService = {
  async list(query: ProductQueryInput) {
    const { search, brand, categoryId, skinType, minPrice, maxPrice, page, limit } = query;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(categoryId && { categoryId }),
      ...(skinType && { skinType }),
      ...(brand && { brand: { equals: brand, mode: "insensitive" } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product || !product.isActive) throw ApiError.notFound("Produit introuvable");
    return product;
  },

  async create(input: CreateProductInput) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw ApiError.badRequest("Catégorie inexistante");
    return prisma.product.create({ data: input, include: { category: true } });
  },

  async update(id: string, input: UpdateProductInput) {
    await this.getById(id);
    if (input.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
      if (!category) throw ApiError.badRequest("Catégorie inexistante");
    }
    return prisma.product.update({ where: { id }, data: input, include: { category: true } });
  },

  /** Désactivation logique plutôt que suppression : préserve l'historique des commandes passées. */
  async deactivate(id: string) {
    await this.getById(id);
    return prisma.product.update({ where: { id }, data: { isActive: false } });
  },

  /**
   * Recommandations "règles" (V1, sans ML) :
   * même catégorie + même type de peau (ou TOUS) + prix proche (±30%) + en stock,
   * en excluant le produit courant, triées par écart de prix croissant.
   */
  async getRecommendations(productId: string, take = 4) {
    const product = await this.getById(productId);
    const price = Number(product.price);
    const minPrice = price * 0.7;
    const maxPrice = price * 1.3;

    const candidates = await prisma.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        categoryId: product.categoryId,
        stock: { gt: 0 },
        price: { gte: minPrice, lte: maxPrice },
        OR: [{ skinType: product.skinType }, { skinType: "TOUS" }],
      },
      include: { category: true },
      take: take * 2, // marge pour trier ensuite par proximité de prix
    });

    return candidates
      .sort((a, b) => Math.abs(Number(a.price) - price) - Math.abs(Number(b.price) - price))
      .slice(0, take);
  },
};
