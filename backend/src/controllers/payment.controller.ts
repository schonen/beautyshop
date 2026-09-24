import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { paymentService } from "../services/payment.service";
import { ApiError } from "../utils/ApiError";

export const paymentController = {
  simulate: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const idempotencyKey = (req.headers["idempotency-key"] as string | undefined) ?? req.body.idempotencyKey;
    const result = await paymentService.simulate(req.params.orderId, req.user, req.body, idempotencyKey);
    res.status(201).json({ success: true, data: result });
  }),

  getForOrder: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const payment = await paymentService.getForOrder(req.params.orderId, req.user);
    res.json({ success: true, data: payment });
  }),

  cancelUnpaidOrder: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const order = await paymentService.cancelUnpaidOrder(req.params.orderId, req.user);
    res.json({ success: true, data: order });
  }),
};
