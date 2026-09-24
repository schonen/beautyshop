import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// En dev, tsx watch recharge le module à chaque changement de fichier :
// sans ce cache global, on ouvrirait une nouvelle connexion Prisma à chaque reload
// et on finirait par épuiser le pool de connexions PostgreSQL.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.isProd ? ["error", "warn"] : ["query", "error", "warn"],
  });

if (!env.isProd) {
  global.__prisma = prisma;
}
