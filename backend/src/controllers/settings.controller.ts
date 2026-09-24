import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { settingsService } from "../services/settings.service";

export const settingsController = {
  getStore: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.getStoreSettings();
    res.json({ success: true, data: settings });
  }),

  updateStore: asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.updateStoreSettings(req.body);
    res.json({ success: true, data: settings });
  }),

  listDeliveryZones: asyncHandler(async (_req: Request, res: Response) => {
    const zones = await settingsService.listDeliveryZones();
    res.json({ success: true, data: zones });
  }),

  upsertDeliveryZone: asyncHandler(async (req: Request, res: Response) => {
    const zone = await settingsService.upsertDeliveryZone(req.body);
    res.status(201).json({ success: true, data: zone });
  }),

  deleteDeliveryZone: asyncHandler(async (req: Request, res: Response) => {
    await settingsService.deleteDeliveryZone(req.params.id);
    res.status(204).send();
  }),
};
