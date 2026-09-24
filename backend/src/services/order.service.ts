import { OrderStatus } from "@prisma/client";
import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import { CreateOrderInput, OrderQueryInput } from "../validators/order.validator";
import { settingsService } from "./settings.service";
import { deliveryService } from "./delivery.service";

const orderInclude = {
  items: { include: { product: true } },
  payment: true,
  user: { select: { name: true, email: true } },
} as const;

/**
 * Transitions de statut autorisées, cohérentes avec le mode de réception.
 * Toute transition absente de cette table est refusée (évite par ex. une commande
 * non payée qui passerait directement à DELIVERED).
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["CANCELLED"],
  PAID: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_PICKUP: ["PICKED_UP", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  PICKED_UP: [],
  CANCELLED: [],
};

export const orderService = {
  /**
   * Création atomique du checkout : vérifie le stock, fige les prix, calcule le sous-total,
   * valide et calcule les frais de livraison côté serveur (jamais depuis le frontend),
   * réserve le stock et crée la commande en PENDING_PAYMENT.
   */
  async create(userId: string, input: CreateOrderInput) {
    const settings = await settingsService.getStoreSettings();

    let deliveryFee = 0;
    if (input.fulfillment.fulfillmentMethod === "DELIVERY") {
      if (!settings.deliveryEnabled) {
        throw ApiError.badRequest("La livraison n'est pas disponible actuellement");
      }
      deliveryService.assertCityIsServed(input.fulfillment.deliveryCity, settings);
      deliveryFee = await deliveryService.computeDeliveryFee(input.fulfillment.deliveryNeighborhood, settings);
    }

    return prisma.$transaction(async (tx) => {
      const productIds = input.items.map((i) => i.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });

      let subtotal = 0;
      const orderItemsData = input.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product || !product.isActive) {
          throw ApiError.badRequest(`Produit ${item.productId} introuvable`);
        }
        if (product.stock < item.quantity) {
          throw ApiError.badRequest(`Stock insuffisant pour "${product.name}"`);
        }
        const unitPrice = Number(product.price);
        subtotal += unitPrice * item.quantity;
        return { productId: product.id, quantity: item.quantity, unitPrice };
      });

      const total = subtotal + deliveryFee;
      const f = input.fulfillment;

      const order = await tx.order.create({
        data: {
          userId,
          status: "PENDING_PAYMENT",
          subtotal,
          deliveryFee,
          total,
          fulfillmentMethod: f.fulfillmentMethod,
          customerName: f.customerName,
          customerPhone: f.customerPhone,
          ...(f.fulfillmentMethod === "DELIVERY" && {
            deliveryCity: f.deliveryCity,
            deliveryNeighborhood: f.deliveryNeighborhood,
            deliveryAddress: f.deliveryAddress,
            deliveryNotes: f.deliveryNotes,
          }),
          items: { create: orderItemsData },
        },
        include: orderInclude,
      });

      // Stock réservé immédiatement ; libéré si le paiement échoue/est annulé (voir payment.service).
      await Promise.all(
        orderItemsData.map((item) =>
          tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
        )
      );

      return order;
    });
  },

  async listForUser(userId: string, query: OrderQueryInput) {
    const where = { userId, ...(query.status && { status: query.status }) };
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { items, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  },

  async listAll(query: OrderQueryInput) {
    const where = { ...(query.status && { status: query.status }) };
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { items, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  },

  async getById(id: string, requester: { id: string; role: string }) {
    const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!order) throw ApiError.notFound("Commande introuvable");
    if (requester.role !== "ADMIN" && order.userId !== requester.id) {
      throw ApiError.forbidden("Cette commande ne vous appartient pas");
    }
    return order;
  },

  /** Utilisé en interne (payment.service) : ne vérifie pas les droits d'accès. */
  async getRaw(id: string) {
    const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!order) throw ApiError.notFound("Commande introuvable");
    return order;
  },

  async updateStatus(id: string, status: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw ApiError.notFound("Commande introuvable");

    if (!ALLOWED_TRANSITIONS[order.status].includes(status)) {
      throw ApiError.badRequest(
        `Transition de statut invalide : ${order.status} → ${status}`
      );
    }

    const isPickupOnlyStatus = status === "READY_FOR_PICKUP" || status === "PICKED_UP";
    const isDeliveryOnlyStatus = status === "OUT_FOR_DELIVERY" || status === "DELIVERED";
    if (isPickupOnlyStatus && order.fulfillmentMethod !== "PICKUP") {
      throw ApiError.badRequest("Ce statut n'est valable que pour une commande à retirer en boutique");
    }
    if (isDeliveryOnlyStatus && order.fulfillmentMethod !== "DELIVERY") {
      throw ApiError.badRequest("Ce statut n'est valable que pour une commande en livraison");
    }

    return prisma.order.update({ where: { id }, data: { status }, include: orderInclude });
  },
};
