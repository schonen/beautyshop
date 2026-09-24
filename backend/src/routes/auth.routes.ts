import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rateLimiter.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);

export default router;
