import { Request, Response } from 'express';
import { campusService } from './campus.service';
import {
  RedeemInviteInputSchema,
  AdminCreateInviteInputSchema,
  AdminRevokeInviteInputSchema,
} from './campus.schema';

export class CampusController {
  public async getCampuses(_req: Request, res: Response): Promise<void> {
    try {
      const campuses = campusService.listCampuses();
      res.status(200).json({ campuses });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public async redeemInvite(req: Request, res: Response): Promise<void> {
    const authUser = (req as any).user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const parseResult = RedeemInviteInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const result = campusService.redeemInviteCode(authUser.id, parseResult.data);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to redeem invite code' });
    }
  }

  public async adminCreateInvite(req: Request, res: Response): Promise<void> {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const parseResult = AdminCreateInviteInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const invite = campusService.createInviteCode(parseResult.data);
      res.status(201).json({ success: true, invite });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create invite code' });
    }
  }

  public async adminRevokeInvite(req: Request, res: Response): Promise<void> {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const parseResult = AdminRevokeInviteInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      campusService.revokeInviteCode(parseResult.data.inviteId);
      res.status(200).json({ success: true, message: 'Invite code revoked successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to revoke invite code' });
    }
  }
}

export const campusController = new CampusController();
