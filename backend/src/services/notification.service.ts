import { NotificationType, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import { NotificationQueryInput } from "../validators/notification.validator";

interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  userId?: string | null;
  orderId?: string | null;
  paymentId?: string | null;
}

type Db = PrismaClient | Prisma.TransactionClient;

export const notificationService = {
  /**
   * `db` permet de créer la notification dans la même transaction Prisma
   * que le paiement (voir payment.service) plutôt qu'en dehors.
   */
  async create(input: CreateNotificationInput, db: Db = prisma) {
    return db.notification.create({ data: input });
  },

  /** Notification admin : userId = null (visible par tous les admins). */
  async notifyAdmins(input: Omit<CreateNotificationInput, "userId">, db: Db = prisma) {
    return this.create({ ...input, userId: null }, db);
  },

  async listForUser(userId: string, query: NotificationQueryInput) {
    const where = { userId, ...(query.isRead !== undefined && { isRead: query.isRead }) };
    const [items, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { items, unread, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  },

  /** Notifications admin = celles sans userId (diffusées à tout le rôle ADMIN). */
  async listForAdmin(query: NotificationQueryInput) {
    const where = { userId: null, ...(query.isRead !== undefined && { isRead: query.isRead }) };
    const [items, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: null, isRead: false } }),
    ]);
    return { items, unread, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  },

  async markRead(id: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw ApiError.notFound("Notification introuvable");
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  },

  async markAllReadForAdmin() {
    await prisma.notification.updateMany({ where: { userId: null, isRead: false }, data: { isRead: true } });
  },

  async markAllReadForUser(userId: string) {
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  },
};
