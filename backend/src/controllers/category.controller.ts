import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { categoryService } from "../services/category.service";

export const categoryController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.list();
    res.json({ success: true, data: categories });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getById(req.params.id);
    res.json({ success: true, data: category });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.create(req.body);
    res.status(201).json({ success: true, data: category });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.update(req.params.id, req.body);
    res.json({ success: true, data: category });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await categoryService.remove(req.params.id);
    res.status(204).send();
  }),
};
