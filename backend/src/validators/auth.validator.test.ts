import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "./auth.validator";

describe("registerSchema", () => {
  it("accepte un enregistrement valide", () => {
    const result = registerSchema.safeParse({
      name: "Awa Diallo",
      email: "AWA@Example.com",
      password: "Motdepasse1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("awa@example.com"); // normalisé en minuscule
    }
  });

  it("rejette un mot de passe trop faible", () => {
    const result = registerSchema.safeParse({
      name: "Awa Diallo",
      email: "awa@example.com",
      password: "azerty",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("rejette un email invalide", () => {
    const result = loginSchema.safeParse({ email: "pas-un-email", password: "x" });
    expect(result.success).toBe(false);
  });
});
