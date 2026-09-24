import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { paymentController } from "../controllers/payment.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { paymentLimiter } from "../middlewares/rateLimiter.middleware";
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from "../validators/order.validator";
import { simulatePaymentSchema } from "../validators/payment.validator";

const router = Router();

// Toutes les routes commandes exigent d'être connecté
router.use(authenticate);

router.post("/", validate(createOrderSchema), orderController.create);
router.get("/mine", validate(orderQuerySchema, "query"), orderController.listMine);
router.get("/:id", orderController.getById);

router.post(
  "/:orderId/payment",
  paymentLimiter,
  validate(simulatePaymentSchema),
  paymentController.simulate
);
router.get("/:orderId/payment", paymentController.getForOrder);
router.post("/:orderId/cancel", paymentController.cancelUnpaidOrder);

// Admin uniquement
router.get("/", authorize("ADMIN"), validate(orderQuerySchema, "query"), orderController.listAll);
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validate(updateOrderStatusSchema),
  orderController.updateStatus
);

export default router;
