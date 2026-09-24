import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import hpp from "hpp";
import { env } from "./config/env";
import apiRouter from "./routes";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware";
import { globalLimiter } from "./middlewares/rateLimiter.middleware";

/**
 * `app` est séparé de `server.ts` (qui fait app.listen) pour permettre
 * d'importer `app` directement dans les tests (supertest) sans ouvrir de vrai port.
 */
export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(hpp()); // protection contre le HTTP Parameter Pollution (paramètres dupliqués)
app.use(morgan(env.isProd ? "combined" : "dev"));
app.use(globalLimiter);

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
