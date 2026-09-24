import { NextFunction, Request, Response } from "express";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Express n'attrape pas nativement les rejets de Promise dans les handlers async.
 * Sans ça, une erreur async non catchée plante le process au lieu de renvoyer un 500 propre.
 */
export const asyncHandler =
  (fn: AsyncRouteHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
