import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { productService } from "../services/product.service";

export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.list(req.query as any);
    res.json({ success: true, ...result });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getById(req.params.id);
    res.json({ success: true, data: product });
  }),

  getRecommendations: asyncHandler(async (req: Request, res: Response) => {
    const recommendations = await productService.getRecommendations(req.params.id);
    res.json({ success: true, data: recommendations });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.create(req.body);
    res.status(201).json({ success: true, data: product });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.update(req.params.id, req.body);
    res.json({ success: true, data: product });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await productService.deactivate(req.params.id);
    res.status(204).send();
  }),
};
