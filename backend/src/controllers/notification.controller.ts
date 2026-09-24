import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { notificationService } from "../services/notification.service";
import { ApiError } from "../utils/ApiError";

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result =
      req.user.role === "ADMIN"
        ? await notificationService.listForAdmin(req.query as any)
        : await notificationService.listForUser(req.user.id, req.query as any);
    res.json({ success: true, ...result });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markRead(req.params.id);
    res.json({ success: true, data: notification });
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    if (req.user.role === "ADMIN") {
      await notificationService.markAllReadForAdmin();
    } else {
      await notificationService.markAllReadForUser(req.user.id);
    }
    res.json({ success: true });
  }),
};
