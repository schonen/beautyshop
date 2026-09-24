import { describe, it, expect } from "vitest";
import { createOrderSchema } from "./order.validator";

const baseItems = [{ productId: "3b6f1c1e-1a2b-4c3d-9e0f-1a2b3c4d5e6f", quantity: 2 }];

describe("createOrderSchema", () => {
  it("accepte un checkout retrait en boutique", () => {
    const result = createOrderSchema.safeParse({
      items: baseItems,
      fulfillment: {
        fulfillmentMethod: "PICKUP",
        customerName: "Jean Dupont",
        customerPhone: "677889900",
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepte un checkout livraison complet", () => {
    const result = createOrderSchema.safeParse({
      items: baseItems,
      fulfillment: {
        fulfillmentMethod: "DELIVERY",
        customerName: "Jean Dupont",
        customerPhone: "677889900",
        deliveryCity: "Douala",
        deliveryNeighborhood: "Akwa",
        deliveryAddress: "Rue de la Joie",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejette une livraison sans ville", () => {
    const result = createOrderSchema.safeParse({
      items: baseItems,
      fulfillment: {
        fulfillmentMethod: "DELIVERY",
        customerName: "Jean Dupont",
        customerPhone: "677889900",
        deliveryNeighborhood: "Akwa",
        deliveryAddress: "Rue de la Joie",
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejette une commande sans article", () => {
    const result = createOrderSchema.safeParse({
      items: [],
      fulfillment: { fulfillmentMethod: "PICKUP", customerName: "Jean Dupont", customerPhone: "677889900" },
    });
    expect(result.success).toBe(false);
  });
});
