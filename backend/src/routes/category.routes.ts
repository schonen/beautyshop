import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator";

const router = Router();

// Publiques : tout le monde doit pouvoir filtrer le catalogue par catégorie
router.get("/", categoryController.list);
router.get("/:id", categoryController.getById);

// Réservées à l'admin
router.post("/", authenticate, authorize("ADMIN"), validate(createCategorySchema), categoryController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validate(updateCategorySchema), categoryController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), categoryController.remove);

export default router;
