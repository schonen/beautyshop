import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

type Target = "body" | "query" | "params";

/**
 * Valide req[target] contre un schéma Zod et remplace req[target] par la version
 * "parsed" (types coercés, champs inconnus retirés selon le schéma).
 */
export function validate(schema: ZodSchema, target: Target = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return next(
        ApiError.badRequest("Données invalides", result.error.flatten().fieldErrors)
      );
    }

    req[target] = result.data;
    next();
  };
}
