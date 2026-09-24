import { describe, it, expect } from "vitest";
import { cameroonPhoneSchema } from "./common.validator";

describe("cameroonPhoneSchema", () => {
  it("accepte un numéro local 6XXXXXXXX", () => {
    const result = cameroonPhoneSchema.safeParse("677889900");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("677889900");
  });

  it("normalise un numéro avec l'indicatif 237", () => {
    const result = cameroonPhoneSchema.safeParse("237677889900");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("677889900");
  });

  it("rejette un numéro trop court", () => {
    expect(cameroonPhoneSchema.safeParse("6778899").success).toBe(false);
  });

  it("rejette un numéro qui ne commence pas par 6", () => {
    expect(cameroonPhoneSchema.safeParse("577889900").success).toBe(false);
  });
});
