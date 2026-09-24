import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authService } from "../services/auth.service";
import { ApiError } from "../utils/ApiError";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const profile = await authService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: profile });
  }),
};
