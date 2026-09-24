import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validator";

export const categoryService = {
  async list() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  },

  async getById(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw ApiError.notFound("Catégorie introuvable");
    return category;
  },

  async create(input: CreateCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { name: input.name } });
    if (existing) throw ApiError.conflict("Cette catégorie existe déjà");
    return prisma.category.create({ data: input });
  },

  async update(id: string, input: UpdateCategoryInput) {
    await this.getById(id);
    return prisma.category.update({ where: { id }, data: input });
  },

  async remove(id: string) {
    await this.getById(id);
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw ApiError.badRequest(
        "Impossible de supprimer une catégorie contenant des produits. Déplacez ou supprimez d'abord les produits."
      );
    }
    await prisma.category.delete({ where: { id } });
  },
};
