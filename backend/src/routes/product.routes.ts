import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "../validators/product.validator";

const router = Router();

router.get("/", validate(productQuerySchema, "query"), productController.list);
router.get("/:id", productController.getById);
router.get("/:id/recommendations", productController.getRecommendations);

router.post("/", authenticate, authorize("ADMIN"), validate(createProductSchema), productController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validate(updateProductSchema), productController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), productController.remove);

export default router;
