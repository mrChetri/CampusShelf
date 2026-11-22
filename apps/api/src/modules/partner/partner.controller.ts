import type { Request, Response } from 'express';
import { partnerService } from './partner.service';
import {
  CreatePartnerInputSchema,
  UpdatePartnerInputSchema,
  ReviewPartnerInputSchema,
  PartnerTypeSchema,
  PartnerVerificationStatusSchema,
} from './partner.schema';

// GET /api/partners - Public directory of verified partners
export function listPublicPartners(req: Request, res: Response): void {
  try {
    const { campusId, type, search } = req.query;

    const parsedType = typeof type === 'string' ? PartnerTypeSchema.safeParse(type) : null;

    const result = partnerService.listPublicPartners({
      campusId: typeof campusId === 'string' ? campusId : undefined,
      type: parsedType?.success ? parsedType.data : undefined,
      search: typeof search === 'string' ? search : undefined,
    });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list partner directory' });
  }
}

// GET /api/partners/:id - Public partner profile
export function getPartnerById(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const partner = partnerService.getPartnerById(id);
    if (!partner) {
      res.status(404).json({ error: 'Partner organization not found' });
      return;
    }
    res.status(200).json({ partner });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get partner details' });
  }
}

// GET /api/admin/partners - Admin view of all partners
export function listAdminPartners(req: Request, res: Response): void {
  try {
    const { status, type, campusId } = req.query;

    const parsedStatus =
      typeof status === 'string' ? PartnerVerificationStatusSchema.safeParse(status) : null;
    const parsedType = typeof type === 'string' ? PartnerTypeSchema.safeParse(type) : null;

    const result = partnerService.listAllPartners({
      verificationStatus: parsedStatus?.success ? parsedStatus.data : undefined,
      type: parsedType?.success ? parsedType.data : undefined,
      campusId: typeof campusId === 'string' ? campusId : undefined,
    });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list partners' });
  }
}

// POST /api/admin/partners - Admin onboarding
export function createPartner(req: Request, res: Response): void {
  const parsed = CreatePartnerInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  try {
    const partner = partnerService.createPartner(parsed.data, 'PENDING');
    res.status(201).json({
      message: 'Partner organization onboarded successfully in pending review status.',
      partner,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to onboard partner' });
  }
}

// PATCH /api/admin/partners/:id - Admin edit profile
export function updatePartner(req: Request, res: Response): void {
  const parsed = UpdatePartnerInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  try {
    const { id } = req.params;
    const partner = partnerService.updatePartner(id, parsed.data);
    res.status(200).json({
      message: 'Partner organization updated successfully.',
      partner,
    });
  } catch (err: any) {
    if (err.message === 'Partner organization not found') {
      res.status(404).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: err.message || 'Failed to update partner' });
  }
}

// PATCH /api/admin/partners/:id/review - Admin review & verification
export function reviewPartner(req: Request, res: Response): void {
  const parsed = ReviewPartnerInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid review input', details: parsed.error.flatten() });
    return;
  }

  try {
    const { id } = req.params;
    const partner = partnerService.reviewPartner(id, parsed.data);
    res.status(200).json({
      message: `Partner organization review completed: ${partner.verificationStatus}`,
      partner,
    });
  } catch (err: any) {
    if (err.message === 'Partner organization not found') {
      res.status(404).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: err.message || 'Failed to review partner' });
  }
}
