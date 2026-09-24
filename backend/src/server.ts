import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";

const server = app.listen(env.port, () => {
  console.log(`🚀 BeautyShop API démarrée sur http://localhost:${env.port} (${env.nodeEnv})`);
});

// Arrêt propre : on ferme la connexion Prisma et le serveur HTTP proprement
async function shutdown(signal: string) {
  console.log(`\n${signal} reçu, arrêt en cours...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
