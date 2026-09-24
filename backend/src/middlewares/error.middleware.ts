import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} introuvable`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // Erreur métier volontaire
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  // Erreurs Prisma connues (ex: contrainte unique violée)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: `La valeur de "${(err.meta?.target as string[])?.join(", ")}" est déjà utilisée`,
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Ressource introuvable" });
    }
  }

  // Erreur inattendue : on log complet côté serveur, réponse générique côté client
  console.error("💥 Erreur non gérée :", err);

  return res.status(500).json({
    success: false,
    message: "Erreur interne du serveur",
    ...(env.isProd ? {} : { stack: (err as Error)?.stack }),
  });
}
