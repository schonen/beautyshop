/**
 * Erreur "métier" volontairement levée par les services/controllers.
 * Le middleware d'erreurs sait la reconnaître et renvoyer le bon status HTTP,
 * contrairement à une erreur inattendue (bug, panne DB) qui reste un 500.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, details);
  }
  static unauthorized(message = "Non authentifié") {
    return new ApiError(401, message);
  }
  static forbidden(message = "Accès refusé") {
    return new ApiError(403, message);
  }
  static notFound(message = "Ressource introuvable") {
    return new ApiError(404, message);
  }
  static conflict(message: string) {
    return new ApiError(409, message);
  }
  static internal(message = "Erreur interne du serveur", details?: unknown) {
    return new ApiError(500, message, details);
  }
}