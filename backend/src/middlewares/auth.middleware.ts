import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

/**
 * Vérifie la présence et la validité du token JWT (header Authorization: Bearer <token>).
 * Attache { id, role } sur req.user pour les handlers suivants.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Token manquant"));
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized("Token invalide ou expiré"));
  }
}

/**
 * À utiliser APRÈS `authenticate`.
 * Exemple : router.delete("/:id", authenticate, authorize("ADMIN"), controller.remove)
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("Vous n'avez pas les droits pour cette action"));
    }
    next();
  };
}
