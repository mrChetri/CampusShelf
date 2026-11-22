import type { Request, Response } from 'express';
import { campaignService } from './campaign.service';
import {
  CreateCampaignNeedInputSchema,
  UpdateCampaignNeedInputSchema,
  CampaignNeedStatusSchema,
} from './campaign.schema';

// GET /api/campaigns/needs - Public list of campaign needs
export function listCampaignNeeds(req: Request, res: Response): void {
  try {
    const { partnerId, category, status } = req.query;

    const parsedStatus =
      typeof status === 'string' ? CampaignNeedStatusSchema.safeParse(status) : null;

    const result = campaignService.listNeeds({
      partnerId: typeof partnerId === 'string' ? partnerId : undefined,
      category: typeof category === 'string' ? category : undefined,
      status: parsedStatus?.success ? parsedStatus.data : undefined,
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list campaign needs' });
  }
}

// GET /api/campaigns/needs/:id - Single campaign need detail
export function getCampaignNeed(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const need = campaignService.getNeedById(id);
    if (!need) {
      res.status(404).json({ error: 'Campaign need not found' });
      return;
    }
    res.status(200).json({ need });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get campaign need details' });
  }
}

// POST /api/campaigns/needs - Create a campaign need (staff only)
export function createCampaignNeed(req: Request, res: Response): void {
  const parsed = CreateCampaignNeedInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  try {
    const need = campaignService.createNeed(parsed.data);
    res.status(201).json({
      message: 'Campaign book need published successfully.',
      need,
    });
  } catch (err: any) {
    if (err.message === 'Partner organization not found') {
      res.status(404).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: err.message || 'Failed to create campaign need' });
  }
}

// PATCH /api/campaigns/needs/:id - Update a campaign need (staff only)
export function updateCampaignNeed(req: Request, res: Response): void {
  const parsed = UpdateCampaignNeedInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  try {
    const { id } = req.params;
    const need = campaignService.updateNeed(id, parsed.data);
    res.status(200).json({
      message: 'Campaign book need updated successfully.',
      need,
    });
  } catch (err: any) {
    if (err.message === 'Campaign need not found') {
      res.status(404).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: err.message || 'Failed to update campaign need' });
  }
}
