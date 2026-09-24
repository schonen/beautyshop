import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { orderService } from "../services/order.service";
import { ApiError } from "../utils/ApiError";

export const orderController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const order = await orderService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: order });
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await orderService.listForUser(req.user.id, req.query as any);
    res.json({ success: true, ...result });
  }),

  listAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.listAll(req.query as any);
    res.json({ success: true, ...result });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const order = await orderService.getById(req.params.id, req.user);
    res.json({ success: true, data: order });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, data: order });
  }),
};
