import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { notificationQuerySchema } from "../validators/notification.validator";

const router = Router();

router.use(authenticate);

router.get("/", validate(notificationQuerySchema, "query"), notificationController.list);
router.patch("/read-all", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markRead);

export default router;
