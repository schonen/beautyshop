import { Router } from "express";
import { settingsController } from "../controllers/settings.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateStoreSettingsSchema, upsertDeliveryZoneSchema } from "../validators/settings.validator";

const router = Router();

router.get("/store", settingsController.getStore);
router.get("/delivery-zones", settingsController.listDeliveryZones);

router.use(authenticate, authorize("ADMIN"));

router.put("/store", validate(updateStoreSettingsSchema), settingsController.updateStore);
router.post("/delivery-zones", validate(upsertDeliveryZoneSchema), settingsController.upsertDeliveryZone);
router.delete("/delivery-zones/:id", settingsController.deleteDeliveryZone);

export default router;
