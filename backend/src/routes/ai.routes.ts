import { Router } from "express";
import { aiController, chatSchema } from "../controllers/ai.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import rateLimit from "express-rate-limit";

// L'IA coûte de l'argent (API OpenAI) : rate limit dédié, plus strict que le reste
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  message: { success: false, message: "Trop de requêtes à l'assistant, patientez un peu." },
});

const router = Router();

router.post("/chat", authenticate, aiLimiter, validate(chatSchema), aiController.chat);

export default router;
