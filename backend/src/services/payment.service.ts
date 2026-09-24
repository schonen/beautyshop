import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import { SimulatePaymentInput } from "../validators/payment.validator";
import { orderService } from "./order.service";
import { notificationService } from "./notification.service";

const REFERENCE_PREFIX: Record<SimulatePaymentInput["method"], string> = {
  ORANGE_MONEY: "OM",
  MTN_MOBILE_MONEY: "MTN",
  CARD: "CARD",
};

function generateReference(method: SimulatePaymentInput["method"]) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${REFERENCE_PREFIX[method]}-SIM-${date}-${random}`;
}

export const paymentService = {
  /**
   * Simulation pédagogique : aucun véritable service financier n'est appelé.
   * Le montant est TOUJOURS recalculé depuis la commande en base — jamais celui
   * envoyé par le client — et le statut SUCCESS n'est déterminé que par le backend.
   */
  async simulate(
    orderId: string,
    requester: { id: string; role: string },
    input: SimulatePaymentInput,
    idempotencyKey?: string
  ) {
    // Rejeu (double clic, retry réseau) : si cette clé a déjà servi, on renvoie le paiement existant
    // au lieu d'en recréer un second.
    if (idempotencyKey) {
      const existing = await prisma.payment.findUnique({ where: { idempotencyKey } });
      if (existing) {
        return { order: await orderService.getRaw(existing.orderId), payment: existing };
      }
    }

    const order = await orderService.getRaw(orderId);

    if (requester.role !== "ADMIN" && order.userId !== requester.id) {
      throw ApiError.forbidden("Cette commande ne vous appartient pas");
    }
    if (order.payment) {
      throw ApiError.conflict("Le paiement a déjà été effectué pour cette commande");
    }
    if (order.status !== "PENDING_PAYMENT") {
      throw ApiError.badRequest("Cette commande n'est plus en attente de paiement");
    }

    // Montant recalculé depuis la base : le frontend ne peut jamais l'influencer.
    const amount = Number(order.total);
    const reference = generateReference(input.method);

    const cardLast4 = input.method === "CARD" ? input.cardNumber.slice(-4) : undefined;
    const customerPhone = input.method !== "CARD" ? input.phone : undefined;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            orderId,
            method: input.method,
            status: "SUCCESS",
            amount,
            transactionReference: reference,
            idempotencyKey: idempotencyKey ?? null,
            customerPhone,
            cardLast4,
            paidAt: new Date(),
          },
        });

        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
          include: { items: { include: { product: true } }, payment: true, user: { select: { name: true, email: true } } },
        });

        await notificationService.create(
          {
            type: "PAYMENT_SUCCESS",
            title: "Paiement réussi",
            message: `Votre paiement de ${amount.toLocaleString("fr-FR")} FCFA a été simulé avec succès. Commande #${order.id.slice(0, 8)}. Référence : ${reference}.`,
            userId: order.userId,
            orderId: order.id,
            paymentId: payment.id,
          },
          tx
        );

        await notificationService.notifyAdmins(
          {
            type: "PAYMENT_SUCCESS",
            title: "Nouveau paiement reçu",
            message: `Client : ${order.customerName} | Téléphone : ${order.customerPhone} | Commande #${order.id.slice(0, 8)} | Montant : ${amount.toLocaleString("fr-FR")} FCFA | Méthode : ${input.method} | Référence : ${reference} | Mode : ${order.fulfillmentMethod}${order.deliveryCity ? ` | Ville : ${order.deliveryCity}` : ""}`,
            orderId: order.id,
            paymentId: payment.id,
          },
          tx
        );

        return { order: updatedOrder, payment };
      });

      return result;
    } catch (error) {
      // Contrainte unique orderId violée = un paiement a été créé entre-temps (concurrence) :
      // on traite cela comme "déjà payé" plutôt que de renvoyer une erreur 500 opaque.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw ApiError.conflict("Le paiement a déjà été effectué pour cette commande");
      }
      throw error;
    }
  },

  async getForOrder(orderId: string, requester: { id: string; role: string }) {
    const order = await orderService.getById(orderId, requester);
    return order.payment;
  },

  /**
   * Annule une commande impayée et restitue le stock réservé (transaction atomique).
   * Utilisé par exemple si le client abandonne le paiement.
   */
  async cancelUnpaidOrder(orderId: string, requester: { id: string; role: string }) {
    const order = await orderService.getRaw(orderId);
    if (requester.role !== "ADMIN" && order.userId !== requester.id) {
      throw ApiError.forbidden("Cette commande ne vous appartient pas");
    }
    if (order.status !== "PENDING_PAYMENT") {
      throw ApiError.badRequest("Seule une commande en attente de paiement peut être annulée ainsi");
    }

    return prisma.$transaction(async (tx) => {
      await Promise.all(
        order.items.map((item) =>
          tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
        )
      );
      return tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
    });
  },
};
