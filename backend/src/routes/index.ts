import { Router } from "express";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import orderRoutes from "./order.routes";
import aiRoutes from "./ai.routes";
import notificationRoutes from "./notification.routes";
import settingsRoutes from "./settings.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ success: true, message: "OK" }));

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/ai", aiRoutes);
router.use("/notifications", notificationRoutes);
router.use("/settings", settingsRoutes);

export default router;
