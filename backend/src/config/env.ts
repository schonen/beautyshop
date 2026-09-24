import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ Variable d'environnement manquante : ${name}`);
  }
  return value;
}

const jwtSecret = required("JWT_SECRET");
if (jwtSecret.length < 32) {
  throw new Error(
    "❌ JWT_SECRET est trop court (minimum 32 caractères). Génère-en un avec : " +
      `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",

  databaseUrl: required("DATABASE_URL"),

  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  groqApiKey: process.env.GROQ_API_KEY ?? "",

  isProd: process.env.NODE_ENV === "production",
};