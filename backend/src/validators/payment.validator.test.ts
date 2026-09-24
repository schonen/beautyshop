import { describe, it, expect } from "vitest";
import { simulatePaymentSchema } from "./payment.validator";

describe("simulatePaymentSchema", () => {
  it("accepte un paiement Orange Money valide", () => {
    const result = simulatePaymentSchema.safeParse({ method: "ORANGE_MONEY", phone: "677889900" });
    expect(result.success).toBe(true);
  });

  it("rejette un paiement mobile money avec un téléphone invalide", () => {
    const result = simulatePaymentSchema.safeParse({ method: "MTN_MOBILE_MONEY", phone: "123" });
    expect(result.success).toBe(false);
  });

  it("accepte une carte valide et masque tout sauf les 4 derniers chiffres en amont", () => {
    const result = simulatePaymentSchema.safeParse({
      method: "CARD",
      cardNumber: "4242 4242 4242 4242",
      expiryMonth: 12,
      expiryYear: new Date().getFullYear() + 2,
      cvv: "123",
      cardHolder: "Jean Dupont",
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.method === "CARD") {
      expect(result.data.cardNumber).toBe("4242424242424242");
    }
  });

  it("rejette une carte expirée", () => {
    const result = simulatePaymentSchema.safeParse({
      method: "CARD",
      cardNumber: "4242424242424242",
      expiryMonth: 1,
      expiryYear: 2000,
      cvv: "123",
      cardHolder: "Jean Dupont",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un CVV invalide", () => {
    const result = simulatePaymentSchema.safeParse({
      method: "CARD",
      cardNumber: "4242424242424242",
      expiryMonth: 12,
      expiryYear: new Date().getFullYear() + 1,
      cvv: "12",
      cardHolder: "Jean Dupont",
    });
    expect(result.success).toBe(false);
  });
});
