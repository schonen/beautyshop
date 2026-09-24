import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { aiService } from "../services/ai.service";
import { ApiError } from "../utils/ApiError";

export const chatSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

export const aiController = {
  chat: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await aiService.chat(req.user.id, req.body.message);
    res.json({ success: true, data: result });
  }),
};
