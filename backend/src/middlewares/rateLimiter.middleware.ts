import rateLimit from "express-rate-limit";

// Limite globale, appliquée à toute l'API
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de requêtes, réessayez plus tard." },
});

// Limite stricte pour le login/register : cible les attaques par force brute
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de tentatives, réessayez dans quelques minutes." },
});

// Limite dédiée aux tentatives de paiement : ralentit le brute-force de références/montants
export const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de tentatives de paiement, réessayez dans quelques minutes." },
});
